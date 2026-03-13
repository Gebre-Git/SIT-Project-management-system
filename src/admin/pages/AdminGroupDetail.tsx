import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    AlertTriangle,
    ChevronDown,
    ClipboardList,
    LucideIcon
} from 'lucide-react';
import { useGroupDetailData } from '../hooks/useGroupDetailData';
import { AccountabilityEngine } from '../../lib/AccountabilityEngine';
import ProjectAnalytics from '../../components/ProjectAnalytics';
import { format } from 'date-fns';
import { Task, User, SubTask } from '../../types';

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

    const completedTasks = tasks.filter((t: Task) => t.status === 'done').length;
    const progressTasks = tasks.filter((t: Task) => t.status === 'in_progress' || t.status === 'under_review').length;
    const overdueTasks = tasks.filter((t: Task) => t.status !== 'done' && t.deadline && new Date(t.deadline.toDate()) < new Date()).length;
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

            {/* Task Oversight Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-[3rem] p-10 border-2 border-slate-100 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-2xl shadow-blue-500/5"
            >
                <div className="flex items-center gap-6 mb-10">
                    <div className="p-4 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/20">
                        <BarChart3 className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Project Roadmap & Task Oversight</h2>
                        <p className="text-sm font-bold text-slate-500 tracking-tight">Real-time status synchronization • Deadline protection active</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <TaskGroup 
                        title="To Do" 
                        status="todo" 
                        tasks={tasks.filter((t: Task) => t.status === 'todo')} 
                        members={members} 
                        icon={ClipboardList} 
                        color="text-slate-500 bg-slate-50/80"
                    />
                    <TaskGroup 
                        title="Active Development" 
                        status="in_progress" 
                        tasks={tasks.filter((t: Task) => t.status === 'in_progress')} 
                        members={members} 
                        icon={Clock} 
                        color="text-amber-600 bg-amber-50/80"
                    />
                    <TaskGroup 
                        title="Awaiting Review" 
                        status="under_review" 
                        tasks={tasks.filter((t: Task) => t.status === 'under_review')} 
                        members={members} 
                        icon={AlertTriangle} 
                        color="text-purple-600 bg-purple-50/80"
                    />
                    <TaskGroup 
                        title="Completed Archive" 
                        status="done" 
                        tasks={tasks.filter((t: Task) => t.status === 'done')} 
                        members={members} 
                        icon={CheckCircle2} 
                        color="text-emerald-600 bg-emerald-50/80"
                    />
                </div>
            </motion.div>

            {/* Team Members List */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
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
                                <th className="text-center font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-2">Efficiency</th>
                                <th className="text-center font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-2">Role</th>
                                <th className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 px-2">Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member: User) => {
                                const stats = project ? AccountabilityEngine.calculateMemberStats(member.uid, tasks, project) : null;
                                const completionRate = stats ? Math.round((stats.tasksCompleted / (stats.tasksAssigned || 1)) * 100) : 0;
                                
                                return (
                                    <tr key={member.uid} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all rounded-2xl border-b border-slate-50 dark:border-slate-800/30 ${stats?.isAtRisk ? 'bg-red-50/30' : ''}`}>
                                        <td className="py-5 px-2">
                                            <Link to={`/admin/user/${member.uid}`} className="flex items-center gap-4 group/link hover:opacity-80 transition-opacity cursor-pointer">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-lg font-black text-slate-600 dark:text-slate-400 overflow-hidden shadow-inner group-hover/link:scale-110 transition-transform">
                                                        {member.photoURL ? (
                                                            <img src={member.photoURL} alt={member.displayName || ''} className="w-full h-full object-cover" />
                                                        ) : (
                                                            (member.displayName || member.email || '?').charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    {stats?.isAtRisk && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg" title="Member at Risk">
                                                            <AlertTriangle className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover/link:text-blue-600 transition-colors">{member.displayName || 'Anonymous User'}</p>
                                                    <p className="text-xs font-bold text-slate-500">@{member.username || 'user'}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-5 px-2">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{member.email}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.school || 'Unverified Region'}</p>
                                        </td>
                                        <td className="py-5 px-2">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="relative w-8 h-8">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" />
                                                        <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={88} strokeDashoffset={88 - (88 * completionRate) / 100} className={completionRate > 80 ? 'text-emerald-500' : completionRate > 40 ? 'text-blue-500' : 'text-red-500'} strokeLinecap="round" />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black">{completionRate}%</span>
                                                </div>
                                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{stats?.tasksCompleted}/{stats?.tasksAssigned} Tasks</p>
                                            </div>
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
                                            <div className="flex flex-col items-end">
                                                <p className={`text-sm font-black uppercase tracking-tighter ${stats?.contributionScore && stats.contributionScore > 30 ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                                                    {stats?.contributionScore || 0} pts
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance</p>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

interface TaskGroupProps {
    title: string;
    status: string;
    tasks: Task[];
    members: User[];
    icon: LucideIcon;
    color: string;
}

const TaskGroup: React.FC<TaskGroupProps> = ({ title, status, tasks, members, icon: Icon, color }) => {
    const [isOpen, setIsOpen] = React.useState(status === 'in_progress');

    return (
        <div className="border border-slate-100 dark:border-slate-800 rounded-[1.5rem] overflow-hidden bg-white/50 dark:bg-slate-900/50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
                        <p className="text-xs font-bold text-slate-500">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} assigned</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {Array.from(new Set(tasks.flatMap((t: Task) => t.assignedTo))).slice(0, 3).map(uid => {
                            const m = members.find((u: User) => u.uid === uid);
                            return (
                                <div key={uid} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase overflow-hidden">
                                    {m?.photoURL ? <img src={m.photoURL} alt="" /> : (m?.displayName || '?')[0]}
                                </div>
                            );
                        })}
                        {new Set(tasks.flatMap((t: Task) => t.assignedTo)).size > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                +{new Set(tasks.flatMap((t: Task) => t.assignedTo)).size - 3}
                            </div>
                        )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div className="p-6 pt-0 border-t border-slate-50 dark:border-slate-800/50">
                    {tasks.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No tasks currently in this status</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            {tasks.map((task: Task) => (
                                <TaskCard key={task.id} task={task} members={members} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface TaskCardProps {
    task: Task;
    members: User[];
}

const TaskCard: React.FC<TaskCardProps> = ({ task, members }) => {
    const isOverdue = task.status !== 'done' && task.deadline && new Date(task.deadline.toDate()) < new Date();
    
    return (
        <div className="p-6 rounded-[2rem] border bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 group/card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/20 group-hover/card:bg-blue-500 transition-colors" />
            
            <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                    task.weight === 'large' ? 'bg-red-50 text-red-600 border border-red-100' : 
                    task.weight === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                    'bg-sky-50 text-sky-600 border border-sky-100'
                }`}>
                    {task.weight} Intensity
                </span>
                {isOverdue && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500 text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Critical Overdue
                    </span>
                )}
            </div>
            
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg mb-6 leading-[1.1]">
                {task.title}
            </h4>

            {/* Sub-tasks Section */}
            {task.subTasks && task.subTasks.length > 0 && (
                <div className="mb-6 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sub-Task Execution</p>
                    {task.subTasks.map((st: SubTask) => {
                        const m = members.find((u: User) => u.uid === st.assignedTo);
                        return (
                            <div key={st.id} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`p-1 rounded-md ${st.status === 'done' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                        <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                    <span className={`text-xs font-bold truncate tracking-tight ${st.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {st.title}
                                    </span>
                                </div>
                                {m && (
                                    <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                                            {m.photoURL ? <img src={m.photoURL} alt="" /> : <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[8px] font-black">{(m.username || 'U')[0]}</div>}
                                        </div>
                                        <span className="text-[8px] font-black uppercase text-slate-500">{m.username}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {task.assignedTo?.map((uid: string) => {
                            const m = members.find((u: User) => u.uid === uid);
                            return (
                                <div key={uid} title={m?.displayName || ''} className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400 border-2 border-white dark:border-slate-900 overflow-hidden shadow-sm">
                                    {m?.photoURL ? <img src={m.photoURL} alt="" className="w-full h-full object-cover" /> : (m?.displayName || '?')[0]}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Target Date</span>
                    </div>
                    <span className={`text-xs font-black tracking-tight ${isOverdue ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {task.deadline ? format(task.deadline.toDate(), 'MMM dd, yyyy') : 'NO DEADLINE'}
                    </span>
                </div>
            </div>
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
