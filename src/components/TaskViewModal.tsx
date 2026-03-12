import React from 'react';
import { Task, User } from '../types';
import { X, Calendar, Clock, User as UserIcon, CheckCircle, Box, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import ProfileAvatar from './ProfileAvatar';

interface TaskViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    members: User[];
}

const TaskViewModal: React.FC<TaskViewModalProps> = ({ isOpen, onClose, task, members }) => {
    if (!isOpen) return null;

    const isDone = task.status === 'done';
    const deadlineDate = task.deadline.toDate();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                            isDone ? "bg-emerald-500 shadow-emerald-500/20" : "bg-blue-600 shadow-blue-600/20"
                        )}>
                            {isDone ? <CheckCircle className="w-6 h-6 text-white" /> : <Layout className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mission Details</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Operational Overview</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:rotate-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
                    {/* Title & Description */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className={cn(
                                "text-xl sm:text-3xl font-black tracking-tight",
                                isDone ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"
                            )}>
                                {task.title}
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                {task.weight} weight
                            </span>
                        </div>
                        {task.description && (
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-semibold italic border-l-4 border-slate-100 dark:border-slate-800 pl-6 py-2">
                                "{task.description}"
                            </p>
                        )}
                    </div>

                    {/* Meta Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Deadline</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{format(deadlineDate, 'MMMM d, yyyy')}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Status</p>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase">{task.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Personnel */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <UserIcon className="w-4 h-4" /> Assigned Personnel
                        </h4>
                        <div className="flex flex-wrap gap-4">
                            {task.assignedTo?.length > 0 ? (
                                task.assignedTo.map(uid => {
                                    const member = members.find(m => m.uid === uid);
                                    if (!member) return null;
                                    return (
                                        <div key={uid} className="flex items-center gap-3 p-3 pr-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group hover:border-blue-500 transition-colors">
                                            <ProfileAvatar photoURL={member.photoURL} displayName={member.displayName || member.username} size="sm" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{member.displayName || member.username}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">@{member.username}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm font-bold text-slate-400 italic">No assets assigned to this mission.</p>
                            )}
                        </div>
                    </div>

                    {/* Sub-tasks */}
                    {task.subTasks && task.subTasks.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Box className="w-4 h-4" /> Strategic Breakdown
                            </h4>
                            <div className="space-y-3">
                                {task.subTasks.map(st => {
                                    const stMember = members.find(m => m.uid === st.assignedTo);
                                    return (
                                        <div key={st.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md flex items-center justify-center border",
                                                    st.status === 'done' ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                )}>
                                                    {st.status === 'done' && <CheckCircle className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    st.status === 'done' ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
                                                )}>
                                                    {st.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {st.requiresUpload && (
                                                    <span className={cn(
                                                        "text-[8px] font-black uppercase px-2 py-0.5 rounded border",
                                                        st.submissionUrl ? "text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10" : "text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-900/10"
                                                    )}>
                                                        {st.submissionUrl ? "Verified✓" : "Evidence Req"}
                                                    </span>
                                                )}
                                                {stMember && (
                                                    <div className="flex items-center gap-2">
                                                        <ProfileAvatar photoURL={stMember.photoURL} displayName={stMember.displayName || stMember.username} size="sm" />
                                                        <span className="text-[10px] font-bold text-slate-400">{stMember.displayName || stMember.username}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:scale-105 active:scale-95"
                    >
                        Close Briefing
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TaskViewModal;
