import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../../types';

interface AdminListProps {
    admins: User[];
}

const AdminList: React.FC<AdminListProps> = ({ admins }) => {
    return (
        <div className="glass-card rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl mt-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 text-white">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Administrators</h2>
                        <p className="text-[10px] font-bold text-slate-500">Users with platform-level control</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                    {admins.length} Total
                </div>
            </div>

            <div className="space-y-3">
                {admins.map((admin, index) => (
                    <motion.div
                        key={admin.uid}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link 
                            to={`/admin/user/${admin.uid}`}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-50 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-black text-slate-600 dark:text-slate-400 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                    {admin.photoURL ? (
                                        <img src={admin.photoURL} alt="" />
                                    ) : (
                                        (admin.displayName || admin.email || '?').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter truncate group-hover:text-blue-600 transition-colors">
                                        {admin.displayName || 'Unnamed Admin'}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate">
                                        {admin.email}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdminList;
