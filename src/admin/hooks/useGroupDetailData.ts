import { useState, useEffect } from 'react';
import {
    doc,
    collection,
    onSnapshot,
    query,
    getDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project, User, Task } from '../../types';

export interface GroupDetailData {
    project: Project | null;
    tasks: Task[];
    members: User[];
    loading: boolean;
    error: string | null;
}

export const useGroupDetailData = (projectId: string): GroupDetailData => {
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId) return;

        const unsubscribers: (() => void)[] = [];

        // 1. Subscribe to the project document
        const projectRef = doc(db, 'projects', projectId);
        unsubscribers.push(
            onSnapshot(projectRef, async (snap) => {
                if (!snap.exists()) {
                    setError('Group not found.');
                    setLoading(false);
                    return;
                }

                const projectData = { ...snap.data(), id: snap.id } as Project;
                setProject(projectData);

                // 2. Resolve member User objects from Firestore
                try {
                    const memberUids: string[] = projectData.members || [];
                    const userPromises = memberUids.map(uid =>
                        getDoc(doc(db, 'users', uid))
                    );
                    const userSnaps = await Promise.all(userPromises);
                    const resolvedUsers = userSnaps
                        .filter(s => s.exists())
                        .map(s => ({ ...s.data(), uid: s.id } as User));
                    setMembers(resolvedUsers);
                } catch (err) {
                    console.error('useGroupDetailData: error fetching members', err);
                }
            }, (err) => {
                console.error('useGroupDetailData: project error', err);
                setError('Failed to load group data.');
                setLoading(false);
            })
        );

        // 3. Subscribe to tasks subcollection
        const tasksQuery = query(collection(db, 'projects', projectId, 'tasks'));
        unsubscribers.push(
            onSnapshot(tasksQuery, (snap) => {
                const tasksData = snap.docs.map(d => ({
                    ...d.data(),
                    id: d.id,
                    projectId,
                } as Task));
                setTasks(tasksData);
                setLoading(false);
            }, (err) => {
                console.error('useGroupDetailData: tasks error', err);
                setError('Failed to load tasks.');
                setLoading(false);
            })
        );

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [projectId]);

    return { project, tasks, members, loading, error };
};
