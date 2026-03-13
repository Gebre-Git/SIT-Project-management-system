import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Shield, 
    ArrowLeft, 
    Star, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Users, 
    TrendingUp,
    ChevronRight,
    ClipboardList,
    Layout
} from 'lucide-react';
import { useGroupDetailData } from '../hooks/useGroupDetailData';
import { AccountabilityEngine } from '../../lib/AccountabilityEngine';
import { format } from 'date-fns';
import { Task, User, SubTask } from '../../types';

const AdminFinalProjectDetail: React.FC = () => {
    const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
    const navigate = useNavigate();
    const { project, tasks, members, loading, error } = useGroupDetailData(projectId || '');

    const task = tasks.find(t => t.id === taskId);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
                    <Star className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Loading final project insights...</p>
            </div>
        );
    }

    if (error || !project || !task) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 font-bold">{error || 'Final Project task not found.'}</p>
                <button 
                    onClick={() => navigate('/admin')}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                    Back to Admin
                </button>
            </div>
        );
    }

    const isOverdue = task.status !== 'done' && task.deadline && new Date(task.deadline.toDate()) < new Date();
    const subTasksDone = task.subTasks?.filter(st => st.status === 'done').length || 0;
    const subTasksTotal = task.subTasks?.length || 0;
    const subTaskProgress = subTasksTotal > 0 ? Math.round((subTasksDone / subTasksTotal) * 100) : 0;

    return (
        <div className="space-y-10 pb-12">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <button 
                    onClick={() => navigate('/admin')}
                    className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Admin Dashboard
                </button>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/20 flex items-center justify-center text-white">
                            <Star className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                    {task.title}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    task.status === 'done' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4" /> {project.name}
                                </span>
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" /> {task.deadline ? format(task.deadline.toDate(), 'MMMM dd, yyyy') : 'No Deadline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Task Details & Sub-tasks */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description Card */}
                    <div className="glass-card rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Assignment Context</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
                            {task.description || 'No description provided for this final project task.'}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Weight</span>
                                <span className="text-lg font-black text-slate-900 dark:text-white uppercase">{task.weight}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Sub-tasks</span>
                                <span className="text-lg font-black text-slate-900 dark:text-white">{subTasksDone}/{subTasksTotal}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Progress</span>
                                <span className="text-lg font-black text-slate-900 dark:text-white">{subTaskProgress}%</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Overdue</span>
                                <span className={`text-lg font-black ${isOverdue ? 'text-red-500' : 'text-emerald-500'}`}>{isOverdue ? 'CRITICAL' : 'ON TRACK'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sub-tasks Breakdown */}
                    <div className="glass-card rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                                    <Layout className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Execution Roadmap</h2>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {task.subTasks && task.subTasks.length > 0 ? task.subTasks.map((st: SubTask) => {
                                const m = members.find((u: User) => u.uid === st.assignedTo);
                                return (
                                    <div key={st.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${st.status === 'done' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className={`font-bold ${st.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {st.title}
                                            </span>
                                        </div>
                                        {m && (
                                            <Link to={`/admin/user/${m.uid}`} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
                                                <div className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
                                                    {m.photoURL ? <img src={m.photoURL} alt="" /> : <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[8px] font-black">{(m.username || 'U')[0]}</div>}
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-blue-600 transition-colors">{m.username}</span>
                                            </Link>
                                        )}
                                    </div>
                                );
                            }) : (
                                <div className="py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                    No sub-tasks defined for this deliverable.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Group Members & Performance */}
                <div className="space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Assigned Team</h2>
                        </div>

                        <div className="space-y-4">
                            {members.map((member: User) => {
                                const stats = AccountabilityEngine.calculateMemberStats(member.uid, tasks, project);
                                const isAssignedToThisTask = task.assignedTo?.includes(member.uid);
                                const completionRate = Math.round((stats.tasksCompleted / (stats.tasksAssigned || 1)) * 100);
                                
                                return (
                                    <div key={member.uid} className={`p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-amber-200 transition-all group ${isAssignedToThisTask ? 'ring-2 ring-amber-500/20' : ''}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <Link to={`/admin/user/${member.uid}`} className="flex items-center gap-3 group/link">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-black text-slate-600 dark:text-slate-400 overflow-hidden shadow-inner group-hover/link:scale-110 transition-transform">
                                                    {member.photoURL ? (
                                                        <img src={member.photoURL} alt="" />
                                                    ) : (
                                                        (member.displayName || member.email || '?').charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter group-hover/link:text-amber-600 transition-colors uppercase">{member.displayName || 'Unnamed'}</p>
                                                    <p className="text-[10px] font-bold text-slate-500">@{member.username}</p>
                                                </div>
                                            </Link>
                                            
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{stats.contributionScore} <span className="text-[9px] text-slate-400">PTS</span></p>
                                                {isAssignedToThisTask && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100">Primary Assignee</span>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Efficiency</span>
                                                <span className={`text-xs font-black ${completionRate > 80 ? 'text-emerald-500' : 'text-blue-500'}`}>{completionRate}%</span>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tasks</span>
                                                <span className="text-xs font-black text-slate-900 dark:text-white">{stats.tasksCompleted}/{stats.tasksAssigned}</span>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Late</span>
                                                <span className={`text-xs font-black ${stats.tasksLate > 0 ? 'text-red-500' : 'text-slate-400'}`}>{stats.tasksLate}</span>
                                            </div>
                                        </div>

                                        {stats.isAtRisk && (
                                            <div className="mt-4 flex items-center gap-2 p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                <span className="text-[9px] font-black uppercase tracking-widest font-black">Efficiency Threshold Breach</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Operational Insights</h3>
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Group Owner</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{members.find(m => m.uid === project.ownerId)?.displayName || 'Platform Owner'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Collaboration Type</span>
                                    <span className="text-xs font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{project.type || 'Team'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFinalProjectDetail;
