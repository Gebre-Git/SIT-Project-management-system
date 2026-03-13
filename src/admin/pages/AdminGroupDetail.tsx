import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Shield, 
    Users, 
    ArrowLeft, 
    BarChart3, 
    CheckCircle2, 
    Clock, 
    TrendingUp,
    Briefcase,
    AlertTriangle
} from 'lucide-react';
import { useGroupDetailData } from '../hooks/useGroupDetailData';
import ProjectAnalytics from '../../components/ProjectAnalytics';
import { format } from 'date-fns';

const AdminGroupDetail: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { project, tasks, members, loading, error } = useGroupDetailData(projectId || '');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <Shield className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Loading detailed group analytics...</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 font-bold">{error || 'Group not found.'}</p>
                <button 
                    onClick={() => navigate('/admin')}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                    Back to Admin
                </button>
            </div>
        );
    }

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const progressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'under_review').length;
    const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline.toDate()) < new Date()).length;
    const efficiency = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-6"
            >
                <div>
                    <button 
                        onClick={() => navigate('/admin')}
                        className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Admin Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 text-white">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        {project.name}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        project.type === 'team' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                    }`}>
                                        {project.type || 'team'}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-bold">{project.course}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                           <div className="text-right">
                               <p className="text-slate-400">Owner</p>
                               <p className="text-slate-900 dark:text-white">Admin Privileges Active</p>
                           </div>
                           <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                               <Shield className="w-6 h-6 text-blue-500" />
                           </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Sub-header Stat Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatBox label="Total Tasks" value={tasks.length} subValue="Platform Average: 12" gradient="from-blue-500 to-indigo-500" icon={BarChart3} />
                <StatBox label="Completed" value={completedTasks} subValue={`${efficiency}% Ratio`} gradient="from-emerald-500 to-teal-500" icon={CheckCircle2} />
                <StatBox label="In Progress" value={progressTasks} subValue="Pending Review" gradient="from-amber-500 to-orange-500" icon={Clock} />
                <StatBox label="Overdue" value={overdueTasks} subValue="Action Required" gradient="from-red-500 to-rose-500" icon={AlertTriangle} />
                <StatBox label="Efficiency" value={`${efficiency}%`} subValue="Overall Health" gradient="from-violet-500 to-purple-500" icon={TrendingUp} />
            </div>

            {/* Detailed Analytics Section */}
            <div className="glass-card rounded-[2.5rem] p-8 border-2 border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Performance Deep-Dive</h2>
                        <p className="text-sm font-bold text-slate-500">Real-time data synchronization active</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>
                
                <ProjectAnalytics project={project} tasks={tasks} members={members} />
            </div>

            {/* Team Members List */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-[2.5rem] p-8 border-2 border-slate-100 dark:border-slate-800/50"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-violet-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Member Directory</h2>
                        <p className="text-sm font-bold text-slate-500">{members.length} active contributors tracked</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-slate-50 dark:border-slate-800/50">
                                <th className="text-left font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-2">Member</th>
                                <th className="text-left font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-2">Contact</th>
                                <th className="text-center font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-2">Role</th>
                                <th className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-2">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.uid} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all rounded-2xl border-b border-slate-50 dark:border-slate-800/30">
                                    <td className="py-5 px-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-lg font-black text-slate-600 dark:text-slate-400 overflow-hidden shadow-inner">
                                                {member.photoURL ? (
                                                    <img src={member.photoURL} alt={member.displayName || ''} className="w-full h-full object-cover" />
                                                ) : (
                                                    (member.displayName || member.email || '?').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{member.displayName || 'Anonymous User'}</p>
                                                <p className="text-xs font-bold text-slate-500">@{member.username || 'user'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-2">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{member.email}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.school || 'Unverified Region'}</p>
                                    </td>
                                    <td className="py-5 px-2 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            member.uid === project.ownerId 
                                            ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' 
                                            : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                        }`}>
                                            {member.uid === project.ownerId ? 'Project Lead' : 'Collaborator'}
                                        </span>
                                    </td>
                                    <td className="py-5 px-2 text-right">
                                        <p className="text-sm font-black text-slate-900 dark:text-white">
                                            {member.createdAt ? format(member.createdAt.toDate(), 'MMM yyyy') : '—'}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Status</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

const StatBox: React.FC<{
    label: string, 
    value: React.ReactNode, 
    subValue: string, 
    gradient: string, 
    icon: React.ElementType
}> = ({ label, value, subValue, gradient, icon: Icon }) => (
    <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity blur-2xl`} />
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                <Icon className="w-5 h-5" />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-300" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-slate-500 mt-2">{subValue}</p>
    </div>
);

export default AdminGroupDetail;
