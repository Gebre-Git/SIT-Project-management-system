import { useState, useEffect } from 'react';
import {
    collection,
    collectionGroup,
    query,
    onSnapshot,
    orderBy,
    limit,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project, User as AppUser, ChatMessage, Task } from '../../types';

export interface TaskStats {
    total: number;
    todo: number;
    done: number;
    overdue: number;
}

export interface AdminData {
    projects: Project[];
    users: AppUser[];
    recentMessages: (ChatMessage & { projectId?: string })[];
    taskStats: TaskStats;
    allTasks: Task[];
    loading: boolean;
    error: string | null;
}

export const useAdminData = (): AdminData => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [recentMessages, setRecentMessages] = useState<(ChatMessage & { projectId?: string })[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [taskStats, setTaskStats] = useState<TaskStats>({ total: 0, todo: 0, done: 0, overdue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribers: (() => void)[] = [];

        try {
            // 1. All Projects
            const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
            unsubscribers.push(
                onSnapshot(projectsQuery, (snap) => {
                    const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Project));
                    setProjects(data);
                }, (err) => {
                    console.error('Admin: projects error', err);
                    setError('Failed to fetch projects.');
                })
            );

            // 2. All Users
            const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            unsubscribers.push(
                onSnapshot(usersQuery, (snap) => {
                    const data = snap.docs.map(d => ({ ...d.data(), uid: d.id } as AppUser));
                    setUsers(data);
                }, (err) => {
                    console.error('Admin: users error', err);
                    setError('Failed to fetch users.');
                })
            );

            // 3. Recent Messages (collectionGroup)
            const messagesQuery = query(
                collectionGroup(db, 'messages'),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
            unsubscribers.push(
                onSnapshot(messagesQuery, (snap) => {
                    const data = snap.docs.map(d => {
                        const msg = { ...d.data(), id: d.id } as ChatMessage & { projectId?: string };
                        // Extract projectId from the document path: projects/{projectId}/messages/{messageId}
                        const pathSegments = d.ref.path.split('/');
                        if (pathSegments.length >= 2) {
                            msg.projectId = pathSegments[1];
                        }
                        return msg;
                    });
                    setRecentMessages(data);
                }, (err) => {
                    console.error('Admin: messages error', err);
                    setError('Failed to fetch messages.');
                })
            );

            // 4. All Tasks (collectionGroup) for stats
            const tasksQuery = query(collectionGroup(db, 'tasks'));
            unsubscribers.push(
                onSnapshot(tasksQuery, (snap) => {
                    const tasks = snap.docs.map(d => {
                        const task = { ...d.data(), id: d.id } as Task;
                        const pathSegments = d.ref.path.split('/');
                        if (pathSegments.length >= 2) {
                            task.projectId = pathSegments[1];
                        }
                        return task;
                    });

                    const now = Timestamp.now();
                    const stats: TaskStats = {
                        total: tasks.length,
                        todo: tasks.filter(t => t.status === 'todo').length,
                        done: tasks.filter(t => t.status === 'done').length,
                        overdue: tasks.filter(t => {
                            return t.status === 'todo' && t.deadline && t.deadline.toMillis() < now.toMillis();
                        }).length,
                    };

                    setAllTasks(tasks);
                    setTaskStats(stats);
                }, (err) => {
                    console.error('Admin: tasks error', err);
                    setError('Failed to fetch tasks.');
                })
            );

            // Loading complete after first snapshot settles
            const timer = setTimeout(() => setLoading(false), 1500);
            unsubscribers.push(() => clearTimeout(timer));

        } catch (err: any) {
            console.error('Admin data error:', err);
            setError(err.message);
            setLoading(false);
        }

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, []);

    return { projects, users, recentMessages, taskStats, allTasks, loading, error };
};
