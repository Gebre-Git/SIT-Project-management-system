import { useState, useEffect } from 'react';
import { 
    doc, 
    onSnapshot, 
    collection, 
    query, 
    where, 
    collectionGroup 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Project, Task } from '../../types';
import { AccountabilityEngine } from '../../lib/AccountabilityEngine';

export interface UserProjectStats {
    project: Project;
    tasksAssigned: number;
    tasksCompleted: number;
    tasksLate: number;
    contributionScore: number;
    isAtRisk: boolean;
}

export interface AggregatedUserStats {
    totalProjects: number;
    totalTasksAssigned: number;
    totalTasksCompleted: number;
    totalTasksLate: number;
    totalContributionScore: number;
    projectBreakdown: UserProjectStats[];
}

export const useUserDetails = (userId: string) => {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<AggregatedUserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        const unsubscribers: (() => void)[] = [];

        try {
            // 1. Subscribe to User Profile
            const userRef = doc(db, 'users', userId);
            const unsubUser = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUser({ ...docSnap.data(), uid: docSnap.id } as User);
                } else {
                    setError('User not found');
                }
            }, (err) => {
                console.error('Error fetching user:', err);
                setError('Failed to fetch user profile');
            });
            unsubscribers.push(unsubUser);

            // 2. Query all projects where user is a member
            const projectsQuery = query(
                collection(db, 'projects'),
                where('members', 'array-contains', userId)
            );

            const unsubProjects = onSnapshot(projectsQuery, async (projectsSnap) => {
                const projects = projectsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Project));
                
                const tasksQuery = query(collectionGroup(db, 'tasks'));
                
                const unsubTasks = onSnapshot(tasksQuery, (tasksSnap) => {
                    const allTasks = tasksSnap.docs.map(d => {
                        const t = { ...d.data(), id: d.id } as Task;
                        const pathSegments = d.ref.path.split('/');
                        if (pathSegments.length >= 2) t.projectId = pathSegments[1];
                        return t;
                    });

                    const projectBreakdown: UserProjectStats[] = projects.map(project => {
                        const projectTasks = allTasks.filter(t => t.projectId === project.id);
                        const memberStats = AccountabilityEngine.calculateMemberStats(userId, projectTasks, project);
                        
                        return {
                            project,
                            tasksAssigned: memberStats.tasksAssigned,
                            tasksCompleted: memberStats.tasksCompleted,
                            tasksLate: memberStats.tasksLate,
                            contributionScore: memberStats.contributionScore,
                            isAtRisk: memberStats.isAtRisk
                        };
                    });

                    const aggregated: AggregatedUserStats = {
                        totalProjects: projects.length,
                        totalTasksAssigned: projectBreakdown.reduce((sum, p) => sum + p.tasksAssigned, 0),
                        totalTasksCompleted: projectBreakdown.reduce((sum, p) => sum + p.tasksCompleted, 0),
                        totalTasksLate: projectBreakdown.reduce((sum, p) => sum + p.tasksLate, 0),
                        totalContributionScore: projectBreakdown.reduce((sum, p) => sum + p.contributionScore, 0),
                        projectBreakdown
                    };

                    setStats(aggregated);
                    setLoading(false);
                });
                unsubscribers.push(unsubTasks);

            }, (err) => {
                console.error('Error fetching projects:', err);
                setError('Failed to fetch user projects');
            });
            unsubscribers.push(unsubProjects);

        } catch (err: any) {
            console.error('useUserDetails error:', err);
            setError(err.message);
            setLoading(false);
        }

        return () => unsubscribers.forEach(unsub => unsub());
    }, [userId]);

    return { user, stats, loading, error };
};
