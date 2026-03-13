import { Shield, ArrowRight } from 'lucide-react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedAdminRoute: React.FC = () => {
    const { currentUser, isSuperAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950 gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <Shield className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Verifying Admin Status...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
                <div className="w-24 h-24 rounded-3xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-8">
                    <Shield className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                    Access Denied
                </h1>
                <p className="max-w-md text-slate-500 font-bold mb-8 leading-relaxed">
                    You do not have the required administrator privileges to access this console. 
                    If you believe this is an error, please contact the system owner.
                </p>
                <Link 
                    to="/dashboard"
                    className="group flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10"
                >
                    Return to Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
