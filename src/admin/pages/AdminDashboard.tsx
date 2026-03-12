import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Users, FolderKanban, MessageSquare,
    CheckCircle2, AlertTriangle, Search,
    TrendingUp, Activity, BarChart3, ExternalLink,
    ChevronDown, ChevronUp, FileText,
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
    <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
    </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
    const { projects, users, recentMessages, taskStats, loading, error } = useAdminData();
    const [projectSearch, setProjectSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [showAllProjects, setShowAllProjects] = useState(false);
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [showAllMessages, setShowAllMessages] = useState(false);

    // User lookup map
    const userMap = useMemo(() => {
        const map: Record<string, string> = {};
        users.forEach(u => { map[u.uid] = u.displayName || u.email || u.uid; });
        return map;
    }, [users]);

    const getUserName = (uid: string) => userMap[uid] || uid.substring(0, 8) + '...';

    // Filtered data
    const filteredProjects = useMemo(() => {
        if (!projectSearch.trim()) return projects;
        const term = projectSearch.toLowerCase();
        return projects.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.course.toLowerCase().includes(term)
        );
    }, [projects, projectSearch]);

    const filteredUsers = useMemo(() => {
        if (!userSearch.trim()) return users;
        const term = userSearch.toLowerCase();
        return users.filter(u =>
            (u.displayName || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term)
        );
    }, [users, userSearch]);

    // Chart data
    const chartData = [
        { name: 'To Do', value: taskStats.todo, color: '#3b82f6' },
        { name: 'In Progress', value: taskStats.inProgress, color: '#f59e0b' },
        { name: 'Under Review', value: taskStats.underReview, color: '#8b5cf6' },
        { name: 'Done', value: taskStats.done, color: '#22c55e' },
        { name: 'Overdue', value: taskStats.overdue, color: '#ef4444' },
    ];

    // Project name lookup
    const projectMap = useMemo(() => {
        const map: Record<string, string> = {};
        projects.forEach(p => { map[p.id] = p.name; });
        return map;
    }, [projects]);

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

    const displayedProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 6);
    const displayedUsers    = showAllUsers    ? filteredUsers    : filteredUsers.slice(0, 8);
    const displayedMessages = showAllMessages ? recentMessages   : recentMessages.slice(0, 10);

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
                                Platform-wide monitoring &amp; management
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
                <StatCard label="Total Projects"  value={projects.length}         icon={FolderKanban}   gradient="from-blue-500 to-cyan-500"    shadowColor="shadow-blue-500/25" delay={0}   />
                <StatCard label="Total Users"      value={users.length}            icon={Users}          gradient="from-violet-500 to-purple-500" shadowColor="shadow-violet-500/25" delay={0.1} />
                <StatCard label="Chat Messages"    value={recentMessages.length}   icon={MessageSquare}  gradient="from-amber-500 to-orange-500" shadowColor="shadow-amber-500/25" delay={0.2} />
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
                    <div className="h-64">
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
                    <div className="flex items-center gap-6 mt-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-blue-500" /> To Do ({taskStats.todo})
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-amber-500" /> In Progress ({taskStats.inProgress})
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-purple-500" /> Under Review ({taskStats.underReview})
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-emerald-500" /> Done ({taskStats.done})
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-red-500" /> Overdue ({taskStats.overdue})
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

            {/* ── Projects Table ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="glass-card rounded-2xl p-6"
            >
                <SectionHeader
                    icon={FolderKanban}
                    title="All Projects"
                    subtitle={`${projects.length} projects across the platform`}
                    gradient="from-blue-500 to-cyan-500"
                    shadowColor="shadow-blue-500/25"
                />
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            placeholder="Search projects by name or course..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Course</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Owner</th>
                                <th className="text-center py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Members</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Created</th>
                                <th className="text-center py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedProjects.map((p) => (
                                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="py-3 px-3">
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                                        <span className="block sm:hidden text-xs text-slate-400 mt-0.5">{p.course}</span>
                                    </td>
                                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{p.course}</td>
                                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">{getUserName(p.ownerId)}</td>
                                    <td className="py-3 px-3 text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                            {p.members?.length || 0}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-slate-400 dark:text-slate-500 text-xs hidden lg:table-cell">
                                        {p.createdAt ? format(p.createdAt.toDate(), 'MMM dd, yyyy') : '—'}
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        <Link
                                            to={`/project/${p.id}`}
                                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            View <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {displayedProjects.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-400">No projects found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredProjects.length > 6 && (
                    <button
                        onClick={() => setShowAllProjects(!showAllProjects)}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                    >
                        {showAllProjects ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All ({filteredProjects.length})</>}
                    </button>
                )}
            </motion.div>

            {/* ── Users Table ────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card rounded-2xl p-6"
            >
                <SectionHeader
                    icon={Users}
                    title="User Management"
                    subtitle={`${users.length} registered users`}
                    gradient="from-violet-500 to-purple-500"
                    shadowColor="shadow-violet-500/25"
                />
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search users by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">School</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedUsers.map((u) => (
                                <tr key={u.uid} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{u.displayName || 'Unnamed'}</p>
                                                <p className="text-xs text-slate-400 sm:hidden truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell truncate max-w-[200px]">{u.email}</td>
                                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">{u.school || '—'}</td>
                                    <td className="py-3 px-3 text-slate-400 dark:text-slate-500 text-xs hidden lg:table-cell">
                                        {u.createdAt ? format(u.createdAt.toDate(), 'MMM dd, yyyy') : '—'}
                                    </td>
                                </tr>
                            ))}
                            {displayedUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-400">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length > 8 && (
                    <button
                        onClick={() => setShowAllUsers(!showAllUsers)}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm text-violet-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-all"
                    >
                        {showAllUsers ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All ({filteredUsers.length})</>}
                    </button>
                )}
            </motion.div>

            {/* ── Chat Activity ──────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="glass-card rounded-2xl p-6"
            >
                <SectionHeader
                    icon={MessageSquare}
                    title="Chat Activity Monitor"
                    subtitle="Recent messages across all projects"
                    gradient="from-amber-500 to-orange-500"
                    shadowColor="shadow-amber-500/25"
                />
                <div className="space-y-3">
                    {displayedMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                                {getUserName(msg.senderId).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {getUserName(msg.senderId)}
                                    </span>
                                    {msg.projectId && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 font-medium">
                                            {projectMap[msg.projectId] || msg.projectId.substring(0, 8)}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                        {msg.createdAt ? format(msg.createdAt.toDate(), 'MMM dd, HH:mm') : ''}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                                    {msg.isDeleted ? (
                                        <span className="italic text-slate-400">Message deleted</span>
                                    ) : msg.fileUrl ? (
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5" />
                                            {msg.fileName || 'File attachment'}
                                        </span>
                                    ) : (
                                        msg.text
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                    {recentMessages.length === 0 && (
                        <p className="text-center py-8 text-slate-400 text-sm">No messages yet.</p>
                    )}
                </div>
                {recentMessages.length > 10 && (
                    <button
                        onClick={() => setShowAllMessages(!showAllMessages)}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                    >
                        {showAllMessages ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All ({recentMessages.length})</>}
                    </button>
                )}
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
