import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Users, FolderKanban, CheckCircle2, AlertTriangle, Search,
    TrendingUp, Activity, BarChart3, ExternalLink,
    ChevronDown, ChevronUp, Filter, Star
} from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import AdminInviteManager from '../components/AdminInviteManager';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
    label: string;
    value: number;
    icon: React.ElementType;
    gradient: string;
    shadowColor: string;
    delay?: number;
}> = ({ label, value, icon: Icon, gradient, shadowColor, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4, ease: 'easeOut' }}
        className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
    >
        <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
        <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity blur-xl`} />
    </motion.div>
);

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    gradient: string;
    shadowColor: string;
}> = ({ icon: Icon, title, subtitle, gradient, shadowColor }) => (
    <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const { projects, users, taskStats, allTasks, loading, error } = useAdminData();
    const [projectSearch, setProjectSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [showAllProjects, setShowAllProjects] = useState(false);
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [groupFilter, setGroupFilter] = useState<'all' | 'team' | 'personal'>('all');

    // Sorting State
    const [projectSort, setProjectSort] = useState<{ by: 'date' | 'score', order: 'asc' | 'desc' }>({ by: 'date', order: 'desc' });
    const [userSort, setUserSort] = useState<{ by: 'date' | 'score', order: 'asc' | 'desc' }>({ by: 'date', order: 'desc' });
    const [finalSort, setFinalSort] = useState<{ by: 'date' | 'score', order: 'asc' | 'desc' }>({ by: 'date', order: 'desc' });

    // User lookup map
    const userMap = useMemo(() => {
        const map: Record<string, string> = {};
        users.forEach(u => { map[u.uid] = u.displayName || u.email || u.uid; });
        return map;
    }, [users]);

    const getUserName = (uid: string) => userMap[uid] || uid.substring(0, 8) + '...';

    // Helper functions for score calculation
    const getProjectEfficiency = (pId: string) => {
        const pTasks = allTasks.filter(t => t.projectId === pId);
        if (pTasks.length === 0) return 0;
        return (pTasks.filter(t => t.status === 'done').length / pTasks.length) * 100;
    };

    const getUserAvgEfficiency = (uId: string) => {
        const userProjects = projects.filter(p => p.members?.includes(uId));
        if (userProjects.length === 0) return 0;
        const totalScore = userProjects.reduce((acc, p) => acc + getProjectEfficiency(p.id), 0);
        return totalScore / userProjects.length;
    };

    // Filtered and Sorted data
    const sortedProjects = useMemo(() => {
        let result = [...projects];

        // 1. Filter
        if (groupFilter !== 'all') {
            result = result.filter(p => {
                const pType = p.type || 'team'; // Default to team if missing
                return pType === groupFilter;
            });
        }
        if (projectSearch.trim()) {
            const term = projectSearch.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(term) ||
                (p.course && p.course.toLowerCase().includes(term))
            );
        }

        // 2. Sort
        result.sort((a, b) => {
            if (projectSort.by === 'date') {
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return projectSort.order === 'asc' ? timeA - timeB : timeB - timeA;
            } else {
                const scoreA = getProjectEfficiency(a.id);
                const scoreB = getProjectEfficiency(b.id);
                return projectSort.order === 'asc' ? scoreA - scoreB : scoreB - scoreA;
            }
        });

        return result;
    }, [projects, projectSearch, groupFilter, projectSort, allTasks]);

    const sortedUsers = useMemo(() => {
        let result = [...users];

        // 1. Filter
        if (userSearch.trim()) {
            const term = userSearch.toLowerCase();
            result = result.filter(u =>
                (u.displayName || '').toLowerCase().includes(term) ||
                (u.email || '').toLowerCase().includes(term)
            );
        }

        // 2. Sort
        result.sort((a, b) => {
            if (userSort.by === 'date') {
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return userSort.order === 'asc' ? timeA - timeB : timeB - timeA;
            } else {
                const scoreA = getUserAvgEfficiency(a.uid);
                const scoreB = getUserAvgEfficiency(b.uid);
                return userSort.order === 'asc' ? scoreA - scoreB : scoreB - scoreA;
            }
        });

        return result;
    }, [users, userSearch, userSort, projects, allTasks]);

    const sortedFinalTasks = useMemo(() => {
        let result = allTasks.filter(t => t.isFinalProject);

        result.sort((a, b) => {
            if (finalSort.by === 'date') {
                const timeA = a.deadline?.toMillis() || 0;
                const timeB = b.deadline?.toMillis() || 0;
                return finalSort.order === 'asc' ? timeA - timeB : timeB - timeA;
            } else {
                const statusMap = { done: 4, under_review: 3, in_progress: 2, todo: 1 };
                const scoreA = statusMap[a.status] || 0;
                const scoreB = statusMap[b.status] || 0;
                return finalSort.order === 'asc' ? scoreA - scoreB : scoreB - scoreA;
            }
        });

        return result;
    }, [allTasks, finalSort]);

    // Chart data
    const chartData = [
        { name: 'To Do', value: taskStats.todo, color: '#3b82f6' },
        { name: 'In Progress', value: taskStats.inProgress, color: '#f59e0b' },
        { name: 'Under Review', value: taskStats.underReview, color: '#8b5cf6' },
        { name: 'Done', value: taskStats.done, color: '#22c55e' },
        { name: 'Overdue', value: taskStats.overdue, color: '#ef4444' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <Shield className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Loading admin data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
        );
    }

    const displayedProjects = showAllProjects ? sortedProjects : sortedProjects.slice(0, 6);
    const displayedUsers    = showAllUsers    ? sortedUsers    : sortedUsers.slice(0, 8);

    const SortControls: React.FC<{
        sortBy: 'date' | 'score',
        sortOrder: 'asc' | 'desc',
        setSort: (s: { by: 'date' | 'score', order: 'asc' | 'desc' }) => void,
        scoreLabel?: string
    }> = ({ sortBy, sortOrder, setSort, scoreLabel = "Performance" }) => (
        <div className="flex items-center gap-2">
            <select
                value={sortBy}
                onChange={(e) => setSort({ by: e.target.value as any, order: sortOrder })}
                className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer font-bold"
            >
                <option value="date">Date Created</option>
                <option value="score">{scoreLabel}</option>
            </select>
            <button
                onClick={() => setSort({ by: sortBy, order: sortOrder === 'asc' ? 'desc' : 'asc' })}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 transition-colors"
                title={sortOrder === 'asc' ? "Ascending" : "Descending"}
            >
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 shadow-xl shadow-blue-500/30">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                Admin Dashboard
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Platform-wide monitoring & management
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <Activity className="w-3.5 h-3.5" />
                    Real-time data
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </motion.div>

            {/* ── Stat Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Groups"     value={projects.filter(p => !p.type || p.type === 'team').length}         icon={FolderKanban}   gradient="from-blue-500 to-cyan-500"    shadowColor="shadow-blue-500/25" delay={0}   />
                <StatCard label="Total Users"      value={users.length}            icon={Users}          gradient="from-violet-500 to-purple-500" shadowColor="shadow-violet-500/25" delay={0.1} />
                <StatCard label="Total Tasks"      value={taskStats.total}         icon={CheckCircle2}   gradient="from-emerald-500 to-teal-500" shadowColor="shadow-emerald-500/25" delay={0.3}/>
            </div>

            {/* ── Kanban Insights + Invite ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <SectionHeader
                        icon={BarChart3}
                        title="Workflow Insights"
                        subtitle="Task distribution across all projects"
                        gradient="from-indigo-500 to-blue-500"
                        shadowColor="shadow-indigo-500/25"
                    />
                    <div className="h-64 mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barSize={48}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-slate-500" />
                                <YAxis tick={{ fontSize: 12 }} className="text-slate-500" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: '12px',
                                        color: '#f8fafc',
                                        fontSize: '12px',
                                    }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-6 text-[10px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded bg-blue-500" /> TO DO {taskStats.todo}
                        </span>
                        <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded bg-amber-500" /> IN PROGRESS {taskStats.inProgress}
                        </span>
                        <span className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded bg-purple-500" /> UNDER REVIEW {taskStats.underReview}
                        </span>
                        <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded bg-emerald-500" /> DONE {taskStats.done}
                        </span>
                    </div>
                </motion.div>

                {/* Invite Manager */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <AdminInviteManager />
                </motion.div>
            </div>

            {/* ── All Groups Table ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="glass-card rounded-2xl p-6"
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <SectionHeader
                        icon={FolderKanban}
                        title="All Groups"
                        subtitle={`${projects.length} groups & projects across the platform`}
                        gradient="from-blue-500 to-cyan-500"
                        shadowColor="shadow-blue-500/25"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                        <SortControls sortBy={projectSort.by} sortOrder={projectSort.order} setSort={setProjectSort} scoreLabel="Efficiency" />
                        <div className="relative min-w-[160px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={groupFilter}
                                onChange={(e) => setGroupFilter(e.target.value as any)}
                                className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                            >
                                <option value="all">All Groups</option>
                                <option value="team">Team Groups</option>
                                <option value="personal">Individual Projects</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            placeholder="Search projects by name or course..."
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400">Project</th>
                                <th className="text-left py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Course</th>
                                <th className="text-left py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Owner</th>
                                <th className="text-center py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400">Members</th>
                                <th className="text-center py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400">Efficiency</th>
                                <th className="text-right py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedProjects.map((p) => (
                                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                    <td className="py-4 px-3">
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{p.name}</div>
                                        <div className="sm:hidden text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{p.course}</div>
                                    </td>
                                    <td className="py-4 px-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell font-medium">{p.course}</td>
                                    <td className="py-4 px-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">{getUserName(p.ownerId)}</td>
                                    <td className="py-4 px-3 text-center">
                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                            {p.members?.length || 0}
                                        </span>
                                    </td>
                                    <td className="py-4 px-3 text-center">
                                        {(() => {
                                            const score = Math.round(getProjectEfficiency(p.id));
                                            const pTasks = allTasks.filter(t => t.projectId === p.id);
                                            const total = pTasks.length;
                                            const done = pTasks.filter(t => t.status === 'done').length;
                                            
                                            return (
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-xs font-black ${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                        {score}%
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-bold">{done}/{total}</span>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="py-4 px-3 text-right">
                                        <Link
                                            to={`/admin/group/${p.id}`}
                                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all inline-flex items-center gap-2"
                                        >
                                            View <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {displayedProjects.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">No groups match your search criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {sortedProjects.length > 6 && (
                    <button
                        onClick={() => setShowAllProjects(!showAllProjects)}
                        className="mt-6 w-full flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-all border border-blue-100 dark:border-blue-900/30"
                    >
                        {showAllProjects ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All {sortedProjects.length} Groups</>}
                    </button>
                )}
            </motion.div>

            {/* ── Final Projects Monitoring ────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="glass-card rounded-2xl p-6"
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <SectionHeader
                        icon={Star}
                        title="Final Projects Monitoring"
                        subtitle="Centralized tracking for crucial course deliverables"
                        gradient="from-amber-500 to-orange-500"
                        shadowColor="shadow-amber-500/25"
                    />
                    <SortControls sortBy={finalSort.by} sortOrder={finalSort.order} setSort={setFinalSort} scoreLabel="Status Rank" />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400">Assignment</th>
                                <th className="text-left py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Group</th>
                                <th className="text-center py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="text-right py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Deadline</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedFinalTasks.map((task) => {
                                const parentProject = projects.find(p => p.id === task.projectId);
                                const isOverdue = task.deadline && new Date(task.deadline.toDate()) < new Date() && task.status !== 'done';
                                return (
                                    <tr key={task.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-4 px-3">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{task.title}</div>
                                            <div className="lg:hidden text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                                {task.deadline ? format(task.deadline.toDate(), 'MMM dd') : 'No Deadline'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell font-medium">{parentProject?.name || 'Deleted Group'}</td>
                                        <td className="py-4 px-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                task.status === 'done' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                                task.status === 'under_review' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                                task.status === 'in_progress' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                                'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            }`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3 text-right hidden lg:table-cell">
                                            <span className={`text-[11px] font-bold ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                                                {task.deadline ? format(task.deadline.toDate(), 'MMM dd, yyyy') : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedFinalTasks.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-slate-400 font-medium font-medium">No tasks marked as Final Project yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ── User Management Table ────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card rounded-2xl p-6"
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <SectionHeader
                        icon={Users}
                        title="User Management"
                        subtitle={`${users.length} registered system users`}
                        gradient="from-violet-500 to-purple-500"
                        shadowColor="shadow-violet-500/25"
                    />
                    <SortControls sortBy={userSort.by} sortOrder={userSort.order} setSort={setUserSort} scoreLabel="Avg Efficiency" />
                </div>
                
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search users by name or email..."
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400">User</th>
                                <th className="text-left py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Contact</th>
                                <th className="text-center py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400">Efficiency</th>
                                <th className="text-left py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Affiliation</th>
                                <th className="text-right py-4 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedUsers.map((u) => (
                                <tr key={u.uid} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                    <td className="py-4 px-3">
                                        <Link to={`/admin/user/${u.uid}`} className="flex items-center gap-3 group/link">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-violet-500/20 shrink-0 group-hover/link:scale-110 transition-transform">
                                                {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate group-hover/link:text-violet-500 transition-colors">{u.displayName || 'Unnamed User'}</p>
                                                <p className="text-[10px] text-slate-400 sm:hidden truncate font-bold uppercase tracking-wider">{u.email}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="py-4 px-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell font-medium truncate max-w-[180px]">{u.email}</td>
                                    <td className="py-4 px-3 text-center">
                                        {(() => {
                                            const avg = Math.round(getUserAvgEfficiency(u.uid));
                                            const userProjectCount = projects.filter(p => p.members?.includes(u.uid)).length;

                                            return (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className={`text-xs font-black ${avg >= 80 ? 'text-emerald-500' : avg >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                        {userProjectCount > 0 ? `${avg}%` : '—'}
                                                    </span>
                                                    {userProjectCount > 0 && (
                                                        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                                                            {userProjectCount} {userProjectCount === 1 ? 'GRP' : 'GRPS'}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="py-4 px-3 text-slate-500 dark:text-slate-400 hidden md:table-cell font-medium">{u.school || u.major || '—'}</td>
                                    <td className="py-4 px-3 text-right text-slate-400 dark:text-slate-500 font-bold text-[11px] hidden lg:table-cell">
                                        {u.createdAt ? format(u.createdAt.toDate(), 'MMM dd, yyyy') : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {sortedUsers.length > 8 && (
                    <button
                        onClick={() => setShowAllUsers(!showAllUsers)}
                        className="mt-6 w-full flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-2xl transition-all border border-violet-100 dark:border-violet-900/30"
                    >
                        {showAllUsers ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All {sortedUsers.length} Users</>}
                    </button>
                )}
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
