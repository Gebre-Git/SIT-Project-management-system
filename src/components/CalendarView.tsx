import React, { useState, useMemo, useRef } from 'react';
import { Task, User } from '../types';
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    isPast,
    isToday,
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths,
    subWeeks,
    addWeeks,
    startOfYear,
    endOfYear,
    eachMonthOfInterval,
    isSameMonth,
    addYears,
    subYears,
    differenceInCalendarDays,
    eachDayOfInterval,
    isWithinInterval,
    max as dateMax,
    min as dateMin,
    isBefore,
    isAfter
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Box, Layout, GanttChart } from 'lucide-react';
import { cn } from '../lib/utils';

interface CalendarViewProps {
    tasks: Task[];
    members: User[];
    projectName?: string;
    onTaskClick?: (task: Task) => void;
}

type ViewType = 'week' | 'month' | 'year' | 'timeline';

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, members, projectName, onTaskClick }) => {
    const [viewType, setViewType] = useState<ViewType>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const navigate = (direction: 'prev' | 'next') => {
        if (viewType === 'week') {
            setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        } else if (viewType === 'month' || viewType === 'timeline') {
            setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        } else {
            setCurrentDate(direction === 'prev' ? subYears(currentDate, 1) : addYears(currentDate, 1));
        }
    };

    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [currentDate]);

    const monthDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        return Array.from({ length: 42 }).map((_, i) => addDays(start, i));
    }, [currentDate]);

    const yearMonths = useMemo(() => {
        const start = startOfYear(currentDate);
        const end = endOfYear(currentDate);
        return eachMonthOfInterval({ start, end });
    }, [currentDate]);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-sit-orange/5 dark:shadow-none">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sit-orange rounded-2xl flex items-center justify-center shadow-lg shadow-sit-orange/30">
                        <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            {viewType === 'year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy')}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Timeline</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center shadow-inner overflow-x-auto no-scrollbar max-w-full">
                        {(['week', 'month', 'year', 'timeline'] as ViewType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setViewType(type)}
                                className={cn(
                                    "px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5",
                                    viewType === type ? "bg-white dark:bg-slate-700 text-sit-orange shadow-md" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {type === 'timeline' && <GanttChart className="w-3 h-3" />}
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block mx-2" />

                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('prev')} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition active:scale-90">
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 sm:px-6 py-3 bg-sit-orange/10 dark:bg-sit-orange/20 text-sit-orange text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-2xl border border-sit-orange/20 dark:border-sit-orange/40 hover:bg-sit-orange/20 transition">
                            Today
                        </button>
                        <button onClick={() => navigate('next')} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition active:scale-90">
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={viewType + currentDate.toISOString()}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: 'backOut' }}
                    className="min-h-[600px]"
                >
                    {viewType === 'week' && <WeekMode days={weekDays} tasks={tasks} members={members} onTaskClick={onTaskClick} />}
                    {viewType === 'month' && <MonthMode days={monthDays} tasks={tasks} currentMonth={currentDate} projectName={projectName} onTaskClick={onTaskClick} />}
                    {viewType === 'year' && <YearMode months={yearMonths} tasks={tasks} members={members} />}
                    {viewType === 'timeline' && <TimelineMode tasks={tasks} members={members} currentDate={currentDate} onTaskClick={onTaskClick} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const WeekMode: React.FC<{ days: Date[], tasks: Task[], members: User[], onTaskClick?: (task: Task) => void }> = ({ days, tasks, members, onTaskClick }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 sm:gap-4">
        {days.map((day, i) => {
            const dayTasks = tasks.filter(t => t.deadline && isSameDay(t.deadline.toDate(), day));
            return <DayCard key={i} day={day} tasks={dayTasks} members={members} fullHeight onTaskClick={onTaskClick} />;
        })}
    </div>
);

const MonthMode: React.FC<{ days: Date[], tasks: Task[], currentMonth: Date, projectName?: string, onTaskClick?: (task: Task) => void }> = ({ days, tasks, currentMonth, projectName, onTaskClick }) => (
    <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[700px] lg:min-w-0 grid grid-cols-7 gap-2 sm:gap-3 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-center py-2 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{d}</div>
            ))}
            {days.map((day, i) => {
                const isOtherMonth = !isSameMonth(day, currentMonth);
                const dayTasks = tasks.filter(t => t.deadline && isSameDay(t.deadline.toDate(), day));
                const isTodayDay = isToday(day);

                return (
                    <div
                        key={i}
                        className={cn(
                            "min-h-[100px] sm:min-h-[140px] rounded-2xl sm:rounded-3xl p-2 sm:p-4 border transition-all relative overflow-hidden group",
                            isTodayDay ? "bg-sit-orange border-sit-orange shadow-xl shadow-sit-orange/20 z-10 scale-[1.02]" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-sit-orange/50 dark:hover:border-sit-orange/70",
                            isOtherMonth && "opacity-20 pointer-events-none grayscale"
                        )}
                    >
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <span className={cn("text-base sm:text-lg font-black tabular-nums", isTodayDay ? "text-white" : "text-slate-900 dark:text-white")}>
                                {format(day, 'd')}
                            </span>
                            {dayTasks.length > 0 && !isTodayDay && (
                                <div className="w-1.5 h-1.5 rounded-full bg-sit-orange animate-pulse" />
                            )}
                        </div>

                        <div className="space-y-1 sm:space-y-1.5 overflow-hidden">
                            {dayTasks.slice(0, window.innerWidth < 640 ? 2 : 5).map(t => (
                                <div 
                                    key={t.id} 
                                    onClick={() => onTaskClick?.(t)}
                                    className={cn(
                                        "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-bold truncate transition-colors cursor-pointer",
                                        isTodayDay ? "bg-white/20 text-white hover:bg-white/30" : "bg-sit-orange/10 dark:bg-sit-orange/20 text-sit-orange hover:bg-sit-orange/20 dark:hover:bg-sit-orange/30"
                                    )}
                                >
                                    {t.title}
                                </div>
                            ))}
                            {dayTasks.length > (window.innerWidth < 640 ? 2 : 5) && (
                                <div className={cn("text-[7px] font-black uppercase px-1", isTodayDay ? "text-white/60" : "text-slate-400")}>
                                    + {dayTasks.length - (window.innerWidth < 640 ? 2 : 5)} more
                                </div>
                            )}
                        </div>

                        {projectName && !isOtherMonth && (
                            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 pt-1 sm:pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                <div className={cn(
                                    "flex items-center gap-1 opacity-0 sm:opacity-40 group-hover:opacity-100 transition-opacity",
                                    isTodayDay ? "text-white" : "text-slate-400"
                                )}>
                                    <Box className="w-2 h-2" />
                                    <span className="text-[7px] font-black uppercase tracking-tighter truncate">{projectName}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

const YearMode: React.FC<{ months: Date[], tasks: Task[], members: User[] }> = ({ months, tasks, members }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map((month, i) => (
            <div key={i} className="glass-card p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-sit-orange transition-all flex flex-col">
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-center">
                    {format(month, 'MMMM')}
                </h4>

                <div className="grid grid-cols-7 gap-0.5 mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                        <div key={idx} className="text-[7px] font-black text-slate-300 text-center uppercase">{d}</div>
                    ))}
                    {(() => {
                        const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
                        const days = Array.from({ length: 35 }).map((_, idx) => addDays(start, idx));
                        return days.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, month);
                            const hasTask = tasks.some(t => t.deadline && isSameDay(t.deadline.toDate(), day));
                            const isTodayDay = isToday(day);

                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "aspect-square flex items-center justify-center text-[8px] rounded-sm transition-colors",
                                        !isCurrentMonth ? "opacity-0" :
                                            isTodayDay ? "bg-sit-orange text-white font-black" :
                                                hasTask ? "bg-sit-orange/10 dark:bg-sit-orange/20 text-sit-orange font-bold" : "text-slate-400"
                                    )}
                                >
                                    {isCurrentMonth ? format(day, 'd') : ''}
                                </div>
                            );
                        });
                    })()}
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                        <span>Tasks: {tasks.filter(t => t.deadline && isSameMonth(t.deadline.toDate(), month)).length}</span>
                        <div className="flex -space-x-1">
                            {Array.from(new Set(tasks.filter(t => t.deadline && isSameMonth(t.deadline.toDate(), month)).flatMap(t => t.assignedTo || []))).slice(0, 3).map(uid => {
                                const m = members.find(user => user.uid === uid);
                                return (
                                    <div key={uid} className="w-3 h-3 rounded-full bg-slate-200 ring-1 ring-white dark:ring-slate-900 overflow-hidden">
                                        {m?.photoURL ? <img src={m.photoURL} className="w-full h-full object-cover" alt="" /> : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const DayCard: React.FC<{ day: Date, tasks: Task[], members: User[], fullHeight?: boolean, onTaskClick?: (task: Task) => void }> = ({ day, tasks, members, fullHeight, onTaskClick }) => {
    const isCurrentDay = isToday(day);

    return (
        <div className={cn(
            "flex flex-col rounded-3xl p-6 border transition-all duration-300",
            fullHeight ? "min-h-[350px]" : "min-h-[160px]",
            isCurrentDay
                ? "bg-sit-orange/5 border-sit-orange/20 dark:bg-sit-orange/5 dark:border-sit-orange/30 shadow-xl shadow-sit-orange/5 ring-1 ring-sit-orange/20"
                : "glass-card border-slate-200/60 dark:border-slate-800 hover:shadow-lg"
        )}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className={cn(
                        "text-[10px] uppercase font-black tracking-[0.2em] mb-1",
                        isCurrentDay ? "text-sit-orange" : "text-slate-400"
                    )}>
                        {format(day, 'EEEE')}
                    </p>
                    <p className={cn(
                        "text-4xl font-black tabular-nums tracking-tighter",
                        isCurrentDay ? "text-sit-orange" : "text-slate-900 dark:text-white"
                    )}>
                        {format(day, 'd')}
                    </p>
                </div>
                {isCurrentDay && (
                    <div className="w-3.5 h-3.5 rounded-full bg-sit-orange shadow-[0_0_15px_rgba(254,88,35,0.7)] animate-pulse" />
                )}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                        <Layout className="w-8 h-8 mb-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Clear</span>
                    </div>
                ) : (
                    tasks.map(task => {
                        const isDone = task.status === 'done';
                        const isOverdue = !isDone && isPast(day) && !isToday(day);

                        return (
                            <motion.div
                                onClick={() => onTaskClick?.(task)}
                                className={cn(
                                    "p-4 rounded-2xl text-[10px] font-bold border transition-all shadow-sm cursor-pointer",
                                    isDone
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                        : isOverdue
                                            ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                                            : "bg-white dark:bg-slate-800 text-slate-700 border-slate-200 dark:border-slate-700/50 hover:border-sit-orange"
                                )}
                            >
                                <p className="leading-tight mb-3 tracking-tight font-black">{task.title}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex -space-x-2">
                                        {task.assignedTo?.map(uid => {
                                            const m = members.find(u => u.uid === uid);
                                            return (
                                                <div key={uid} className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 overflow-hidden shadow-md">
                                                    {m?.photoURL ? <img src={m.photoURL} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] font-black">{m?.username?.[0] || 'U'}</div>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <span className="text-[8px] opacity-40 uppercase font-black bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">{task.weight}</span>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

// ─── Status color map ────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bar: string; badge: string; dot: string }> = {
    todo:         { bar: 'bg-slate-400/80 dark:bg-slate-500/80',       badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',         dot: 'bg-slate-400' },
    in_progress:  { bar: 'bg-sit-orange/90',                             badge: 'bg-sit-orange/10 dark:bg-sit-orange/20 text-sit-orange',                  dot: 'bg-sit-orange animate-pulse' },
    under_review: { bar: 'bg-amber-400/90',                             badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',       dot: 'bg-amber-400' },
    done:         { bar: 'bg-emerald-500/90',                           badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
};

const STATUS_LABELS: Record<string, string> = {
    todo: 'To do',
    in_progress: 'In progress',
    under_review: 'Review',
    done: 'Done',
};

const CELL_WIDTH = 48; // px per day
const ROW_HEIGHT = 56; // px per task row

const TimelineMode: React.FC<{
    tasks: Task[];
    members: User[];
    currentDate: Date;
    onTaskClick?: (task: Task) => void;
}> = ({ tasks, members, currentDate, onTaskClick }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const rangeStart = startOfMonth(currentDate);
    const rangeEnd   = endOfMonth(currentDate);
    const days = useMemo(() => eachDayOfInterval({ start: rangeStart, end: rangeEnd }), [rangeStart.toISOString()]);
    const totalDays  = days.length;

    // Tasks that overlap with the current month
    const visibleTasks = useMemo(() => tasks.filter(t => {
        if (!t.deadline) return false;
        const taskStart = t.createdAt ? t.createdAt.toDate() : rangeStart;
        const taskEnd   = t.deadline.toDate();
        return !isAfter(taskStart, rangeEnd) && !isBefore(taskEnd, rangeStart);
    }), [tasks, rangeStart.toISOString(), rangeEnd.toISOString()]);

    // Today's offset column
    const todayOffset = useMemo(() => {
        if (isWithinInterval(new Date(), { start: rangeStart, end: rangeEnd })) {
            return differenceInCalendarDays(new Date(), rangeStart);
        }
        return -1;
    }, [rangeStart.toISOString()]);

    const getBarStyle = (task: Task) => {
        const taskStart = task.createdAt ? task.createdAt.toDate() : rangeStart;
        const taskEnd   = task.deadline!.toDate();
        const clampedStart = dateMax([taskStart, rangeStart]);
        const clampedEnd   = dateMin([taskEnd,   rangeEnd]);
        const startCol = differenceInCalendarDays(clampedStart, rangeStart);
        const span     = differenceInCalendarDays(clampedEnd, clampedStart) + 1;
        return { left: startCol * CELL_WIDTH, width: Math.max(span * CELL_WIDTH - 4, CELL_WIDTH - 4) };
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <div className={cn('w-2.5 h-2.5 rounded-full', STATUS_STYLES[key]?.dot)} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                    </div>
                ))}
                <div className="ml-auto text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-wider">
                    {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="flex overflow-hidden">
                {/* Frozen task-name column */}
                <div className="flex-shrink-0 w-44 sm:w-56 border-r border-slate-100 dark:border-slate-800 z-10 bg-white dark:bg-slate-900">
                    {/* Header spacer */}
                    <div className="h-10 border-b border-slate-100 dark:border-slate-800 flex items-center px-4">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Task</span>
                    </div>
                    {visibleTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 opacity-20">
                            <GanttChart className="w-8 h-8 mb-2 text-slate-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">No tasks</span>
                        </div>
                    ) : (
                        visibleTasks.map((task) => {
                            const s = STATUS_STYLES[task.status] ?? STATUS_STYLES.todo;
                            return (
                                <div
                                    key={task.id}
                                    style={{ height: ROW_HEIGHT }}
                                    className="flex items-center gap-2 px-3 border-b border-slate-50 dark:border-slate-800/60 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    onClick={() => onTaskClick?.(task)}
                                >
                                    <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', s.dot)} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-black text-slate-800 dark:text-slate-100 truncate leading-tight group-hover:text-sit-orange transition-colors">
                                            {task.title}
                                        </p>
                                        <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded-md mt-0.5 inline-block', s.badge)}>
                                            {STATUS_LABELS[task.status] ?? task.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Scrollable grid */}
                <div ref={scrollRef} className="flex-1 overflow-x-auto no-scrollbar">
                    <div style={{ width: totalDays * CELL_WIDTH, minWidth: '100%' }}>
                        {/* Day headers */}
                        <div
                            className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10"
                            style={{ height: 40 }}
                        >
                            {days.map((day, i) => (
                                <div
                                    key={i}
                                    style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
                                    className={cn(
                                        'flex flex-col items-center justify-center border-r border-slate-50 dark:border-slate-800/60 select-none',
                                        isToday(day) && 'bg-sit-orange'
                                    )}
                                >
                                    <span className={cn(
                                        'text-[7px] font-black uppercase tracking-wider leading-none',
                                        isToday(day) ? 'text-white/70' : 'text-slate-300 dark:text-slate-600'
                                    )}>
                                        {format(day, 'EEE')}
                                    </span>
                                    <span className={cn(
                                        'text-[11px] font-black leading-none mt-0.5',
                                        isToday(day) ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Task rows */}
                        {visibleTasks.length === 0 ? (
                            <div style={{ height: ROW_HEIGHT * 3 }} />
                        ) : (
                            visibleTasks.map((task, rowIdx) => {
                                const { left, width } = getBarStyle(task);
                                const s = STATUS_STYLES[task.status] ?? STATUS_STYLES.todo;
                                const isDone = task.status === 'done';
                                const isOverdue = !isDone && task.deadline && isPast(task.deadline.toDate()) && !isToday(task.deadline.toDate());

                                return (
                                    <div
                                        key={task.id}
                                        className="relative border-b border-slate-50 dark:border-slate-800/60 flex"
                                        style={{ height: ROW_HEIGHT }}
                                    >
                                        {/* Day columns background stripes */}
                                        {days.map((day, i) => (
                                            <div
                                                key={i}
                                                style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH, flexShrink: 0 }}
                                                className={cn(
                                                    'h-full border-r border-slate-50 dark:border-slate-800/40',
                                                    isToday(day) && 'bg-sit-orange/10 dark:bg-sit-orange/5',
                                                    i % 2 === 0 && !isToday(day) && 'bg-slate-50/50 dark:bg-slate-800/20'
                                                )}
                                            />
                                        ))}

                                        {/* Today vertical line */}
                                        {todayOffset >= 0 && (
                                            <div
                                                className="absolute top-0 bottom-0 w-px bg-sit-orange/40 pointer-events-none z-10"
                                                style={{ left: todayOffset * CELL_WIDTH + CELL_WIDTH / 2 }}
                                            />
                                        )}

                                        {/* Task bar */}
                                        <motion.div
                                            className={cn(
                                                'absolute top-1/2 -translate-y-1/2 rounded-xl flex items-center gap-2 px-3 shadow-sm cursor-pointer border border-white/30 dark:border-black/20 overflow-hidden group',
                                                s.bar,
                                                isOverdue && 'ring-1 ring-red-400'
                                            )}
                                            style={{ left: left + 2, width, height: ROW_HEIGHT - 16 }}
                                            initial={{ opacity: 0, scaleX: 0.8, originX: 0 }}
                                            animate={{ opacity: 1, scaleX: 1 }}
                                            transition={{ delay: rowIdx * 0.04, duration: 0.35, ease: 'backOut' }}
                                            whileHover={{ filter: 'brightness(1.12)', transition: { duration: 0.15 } }}
                                            onClick={() => onTaskClick?.(task)}
                                        >
                                            {/* Avatar stack */}
                                            <div className="flex -space-x-1.5 flex-shrink-0">
                                                {(task.assignedTo ?? []).slice(0, 2).map(uid => {
                                                    const m = members.find(u => u.uid === uid);
                                                    return (
                                                        <div key={uid} className="w-5 h-5 rounded-full ring-2 ring-white/30 bg-white/20 overflow-hidden flex-shrink-0">
                                                            {m?.photoURL
                                                                ? <img src={m.photoURL} alt="" className="w-full h-full object-cover" />
                                                                : <div className="w-full h-full flex items-center justify-center text-[7px] font-black text-white">{m?.username?.[0] ?? '?'}</div>
                                                            }
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <span className="text-white text-[9px] font-black truncate leading-tight drop-shadow-sm">
                                                {task.title}
                                            </span>
                                            {task.deadline && (
                                                <span className="ml-auto text-white/60 text-[8px] font-bold flex-shrink-0 hidden sm:block">
                                                    {format(task.deadline.toDate(), 'MMM d')}
                                                </span>
                                            )}
                                        </motion.div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
