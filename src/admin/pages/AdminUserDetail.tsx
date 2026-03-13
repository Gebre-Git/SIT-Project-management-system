import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Shield, 
    ArrowLeft, 
    TrendingUp, 
    Activity, 
    Mail, 
    GraduationCap, 
    Calendar,
    Briefcase,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ChevronRight,
    User as UserIcon
} from 'lucide-react';
import { useUserDetails } from '../hooks/useUserDetails';
import { format } from 'date-fns';

const StatBox: React.FC<{
    label: string;
    value: string | number;
    subValue: string;
    icon: React.ElementType;
    gradient: string;
}> = ({ label, value, subValue, icon: Icon, gradient }) => (
    <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity blur-2xl -mr-8 -mt-8`} />
        
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        </div>
        
        <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                {value}
            </span>
            <span className="text-xs font-bold text-slate-500">{subValue}</span>
        </div>
    </div>
);

const AdminUserDetail: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { user, stats, loading, error } = useUserDetails(userId || '');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <Shield className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Aggregating user performance data...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 font-bold">{error || 'User not found.'}</p>
                <button 
                    onClick={() => navigate('/admin')}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                    Back to Admin
                </button>
            </div>
        );
    }

    const onTimeRate = stats?.totalTasksCompleted ? Math.round(((stats.totalTasksCompleted - stats.totalTasksLate) / stats.totalTasksCompleted) * 100) : 0;

    return (
        <div className="space-y-10 pb-12">
            {/* Header / Back Button */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <button 
                    onClick={() => navigate('/admin')}
                    className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to User Management
                </button>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-violet-600 to-purple-600 shadow-2xl shadow-violet-500/20 flex items-center justify-center text-3xl font-black text-white relative group overflow-hidden">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                                (user.displayName || user.email || '?').charAt(0).toUpperCase()
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                    {user.displayName || 'Unnamed User'}
                                </h1>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                                    Active User
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                                    <Activity className="w-4 h-4" /> @{user.username}
                                </span>
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" /> {user.email}
                                </span>
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" /> Joined {format(user.createdAt.toDate(), 'MMMM yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Administrative Status</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Full Review Mode Active</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-500 shadow-inner">
                            <Shield className="w-7 h-7" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatBox 
                    label="Platform Score" 
                    value={stats?.totalContributionScore || 0} 
                    subValue="Cumulative Impact" 
                    gradient="from-blue-600 to-indigo-600" 
                    icon={TrendingUp} 
                />
                <StatBox 
                    label="Participated" 
                    value={stats?.totalProjects || 0} 
                    subValue="Total Projects" 
                    gradient="from-violet-600 to-purple-600" 
                    icon={Briefcase} 
                />
                <StatBox 
                    label="Completed" 
                    value={stats?.totalTasksCompleted || 0} 
                    subValue={`${onTimeRate}% On-Time Rate`} 
                    gradient="from-emerald-500 to-teal-500" 
                    icon={CheckCircle2} 
                />
                <StatBox 
                    label="Late Submissions" 
                    value={stats?.totalTasksLate || 0} 
                    subValue="Intervention Risk" 
                    gradient="from-red-500 to-rose-500" 
                    icon={AlertTriangle} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Details */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 h-full">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                            <UserIcon className="w-5 h-5 text-blue-500" />
                            Academic Profile
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Institution / school</label>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <GraduationCap className="w-5 h-5 text-slate-400" />
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{user.school || 'Not specified'}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Major / field</label>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                        {user.major || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Year / Level</label>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                        {user.year || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Biography</label>
                                <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                    "{user.bio || 'This member hasn\'t written a bio yet.'}"
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Participation History */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-blue-500" />
                                Project Engagement
                            </h2>
                            <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                {stats?.projectBreakdown.length || 0} Total Projects
                            </span>
                        </div>

                        <div className="space-y-4">
                            {stats?.projectBreakdown.map((pStat, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={pStat.project.id}
                                    className="p-6 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all hover:shadow-xl group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900 text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">{pStat.project.name}</h3>
                                                <p className="text-xs font-bold text-slate-500">{pStat.project.course}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</span>
                                                <span className="text-lg font-black text-slate-900 dark:text-white">{pStat.contributionScore}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tasks</span>
                                                <span className="text-lg font-black text-slate-900 dark:text-white">{pStat.tasksCompleted}<span className="text-slate-400 text-xs">/{pStat.tasksAssigned}</span></span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Late</span>
                                                <span className={`text-lg font-black ${pStat.tasksLate > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{pStat.tasksLate}</span>
                                            </div>
                                            <Link 
                                                to={`/admin/group/${pStat.project.id}`}
                                                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>

                                    {pStat.isAtRisk && (
                                        <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest font-black">Performance Alert: Below Efficiency Threshold</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {(!stats || stats.projectBreakdown.length === 0) && (
                                <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-500 font-bold">No project participation history found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetail;
