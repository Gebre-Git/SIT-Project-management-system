import React, { useState } from 'react';
import { Task, TaskStatus, User } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, GripVertical, AlertTriangle } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';
import { format } from 'date-fns';

interface KanbanBoardProps {
    tasks: Task[];
    members: User[];
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onTaskClick: (task: Task) => void;
}

type KanbanColumn = {
    id: TaskStatus;
    title: string;
    color: string;
    bgGradient: string;
    dotColor: string;
    headerBg: string;
};

const COLUMNS: KanbanColumn[] = [
    {
        id: 'todo',
        title: 'To Do',
        color: 'text-slate-600 dark:text-slate-300',
        bgGradient: 'from-slate-50 to-slate-100/50 dark:from-slate-800/60 dark:to-slate-800/30',
        dotColor: 'bg-slate-400',
        headerBg: 'bg-slate-100 dark:bg-slate-800/80',
    },
    {
        id: 'in_progress',
        title: 'In Progress',
        color: 'text-blue-600 dark:text-blue-400',
        bgGradient: 'from-blue-50 to-blue-100/30 dark:from-blue-900/20 dark:to-blue-900/10',
        dotColor: 'bg-blue-500',
        headerBg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
        id: 'under_review',
        title: 'Under Review',
        color: 'text-amber-600 dark:text-amber-400',
        bgGradient: 'from-amber-50 to-amber-100/30 dark:from-amber-900/20 dark:to-amber-900/10',
        dotColor: 'bg-amber-500',
        headerBg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
        id: 'done',
        title: 'Completed',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgGradient: 'from-emerald-50 to-emerald-100/30 dark:from-emerald-900/20 dark:to-emerald-900/10',
        dotColor: 'bg-emerald-500',
        headerBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
];

const WEIGHT_CONFIG = {
    small: { label: 'Low', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    large: { label: 'High', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

const KanbanCard: React.FC<{
    task: Task;
    members: User[];
    onTaskClick: (task: Task) => void;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
}> = ({ task, members, onTaskClick, onDragStart }) => {
    const assignedMembers = members.filter(m => task.assignedTo.includes(m.uid));
    const weightCfg = WEIGHT_CONFIG[task.weight] || WEIGHT_CONFIG.medium;
    const isOverdue = task.deadline?.toDate() < new Date() && task.status !== 'done';

    const deadlineStr = task.deadline
        ? format(task.deadline.toDate(), 'MMM d')
        : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            draggable
            onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, task.id)}
            onClick={() => onTaskClick(task)}
            className="group bg-white dark:bg-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-lg dark:shadow-slate-900/30 border border-slate-100 dark:border-slate-700/50 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
        >
            {/* Drag handle & Priority */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", weightCfg.color)}>
                        {weightCfg.label}
                    </span>
                </div>
                {isOverdue && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                )}
            </div>

            {/* Title */}
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {task.title}
            </h4>

            {/* Description preview */}
            {task.description && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 line-clamp-1">
                    {task.description}
                </p>
            )}

            {/* Sub-tasks progress */}
            {task.subTasks && task.subTasks.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Sub-tasks</span>
                        <span>{task.subTasks.filter(s => s.status === 'done').length}/{task.subTasks.length}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                            style={{
                                width: `${(task.subTasks.filter(s => s.status === 'done').length / task.subTasks.length) * 100}%`
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Footer: Deadline + Avatars */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/30">
                {deadlineStr && (
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-medium",
                        isOverdue ? "text-red-500" : "text-slate-400 dark:text-slate-500"
                    )}>
                        <Clock className="w-3 h-3" />
                        {deadlineStr}
                    </div>
                )}
                <div className="flex -space-x-2">
                    {assignedMembers.slice(0, 3).map(m => (
                        <ProfileAvatar
                            key={m.uid}
                            photoURL={m.photoURL}
                            displayName={m.displayName}
                            size="sm"
                            className="ring-2 ring-white dark:ring-slate-800 w-6 h-6 text-[8px]"
                        />
                    ))}
                    {assignedMembers.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500 ring-2 ring-white dark:ring-slate-800">
                            +{assignedMembers.length - 3}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, members, onStatusChange, onTaskClick }) => {
    const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, columnId: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            onStatusChange(taskId, columnId);
        }
        setDragOverColumn(null);
    };

    const getColumnTasks = (status: TaskStatus) => tasks.filter(t => t.status === status);

    // Tasks with no kanban status default to "todo"
    const unmappedTasks = tasks.filter(t => !['todo', 'in_progress', 'under_review', 'done'].includes(t.status));
    const todoTasks = [...getColumnTasks('todo'), ...unmappedTasks];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-4 lg:gap-6 min-h-[50vh] lg:min-h-[60vh] overflow-x-auto pb-4 snap-x snap-mandatory lg:snap-none lg:grid lg:grid-cols-4 lg:overflow-x-visible no-scrollbar">
                {COLUMNS.map((col) => {
                    const columnTasks = col.id === 'todo' ? todoTasks : getColumnTasks(col.id);
                    const isDropTarget = dragOverColumn === col.id;

                    return (
                        <div
                            key={col.id}
                            onDragOver={(e) => handleDragOver(e, col.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.id)}
                            className={cn(
                                "flex flex-col rounded-2xl border transition-all duration-300 min-w-[280px] sm:min-w-[300px] lg:min-w-0 snap-center shrink-0 lg:shrink",
                                isDropTarget
                                    ? "border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 scale-[1.01] shadow-lg shadow-blue-500/10"
                                    : "border-slate-200/60 dark:border-slate-700/40 bg-gradient-to-b " + col.bgGradient
                            )}
                        >
                            {/* Column Header */}
                            <div className={cn("px-4 py-3 rounded-t-2xl flex items-center justify-between", col.headerBg)}>
                                <div className="flex items-center gap-2.5">
                                    <div className={cn("w-2.5 h-2.5 rounded-full", col.dotColor)} />
                                    <h3 className={cn("text-sm font-bold", col.color)}>{col.title}</h3>
                                </div>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-white/60 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">
                                    {columnTasks.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="flex-1 p-2 sm:p-3 space-y-3 overflow-y-auto max-h-[50vh] lg:max-h-[65vh] custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {columnTasks.map(task => (
                                        <KanbanCard
                                            key={task.id}
                                            task={task}
                                            members={members}
                                            onTaskClick={onTaskClick}
                                            onDragStart={handleDragStart}
                                        />
                                    ))}
                                </AnimatePresence>

                                {/* Empty state */}
                                {columnTasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className={cn("w-10 h-10 rounded-full mb-3 flex items-center justify-center opacity-30", col.headerBg)}>
                                            <div className={cn("w-3 h-3 rounded-full", col.dotColor)} />
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                            No tasks here
                                        </p>
                                        <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">
                                            Drag tasks to this column
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanBoard;
