import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Menu, X, LogOut, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import Logo from '../components/Logo';
import ProfileDropdown from '../components/ProfileDropdown';
import ProfileAvatar from '../components/ProfileAvatar';
import ThemeToggle from '../components/ThemeToggle';
import NotificationPanel from '../components/NotificationPanel';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface SidebarLinkProps {
    to: string;
    icon: any;
    label: string;
    collapsed?: boolean;
}

const SidebarLink = ({ to, icon: Icon, label, collapsed }: SidebarLinkProps) => (
    <NavLink
        to={to}
        title={collapsed ? label : undefined}
        className={({ isActive }) => cn(
            "flex items-center gap-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
            collapsed ? "justify-center px-0 mx-2" : "px-4",
            isActive
                ? "text-white bg-sit-orange font-medium shadow-lg shadow-sit-orange/20"
                : "text-slate-300 hover:text-white hover:bg-white/10"
        )}
    >
        {({ isActive }) => (
            <>
                <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive && "fill-current opacity-100")} />
                {!collapsed && <span className="relative z-10">{label}</span>}
                {!isActive && (
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </>
        )}
    </NavLink>
);

const ProfileSidebarLink = ({ to, collapsed }: { to: string, collapsed?: boolean }) => {
    const { currentUser } = useAuth();

    return (
        <NavLink
            to={to}
            title={collapsed ? "My Profile" : undefined}
            className={({ isActive }) => cn(
                "flex items-center gap-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                collapsed ? "justify-center px-0 mx-2" : "px-4",
                isActive
                    ? "text-white bg-sit-orange font-medium shadow-lg shadow-sit-orange/20"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
        >
            {({ isActive }) => (
                <>
                    <ProfileAvatar
                        photoURL={currentUser?.photoURL}
                        displayName={currentUser?.displayName}
                        size="sm"
                        className={cn("ring-2 ring-transparent transition-all", isActive ? "ring-white/50" : "group-hover:ring-blue-500/30")}
                    />
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="relative z-10 font-medium truncate">
                                {currentUser?.displayName || 'My Profile'}
                            </span>
                            <span className={cn(
                                "text-[10px] truncate transition-colors",
                                isActive ? "text-blue-100" : "text-slate-400"
                            )}>
                                Account Settings
                            </span>
                        </div>
                    )}
                    {!isActive && (
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </>
            )}
        </NavLink>
    );
};

const AppLayout: React.FC = () => {
    const { logout, isSuperAdmin, currentUser, loading } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

    // Auth guard — redirect to login if not authenticated
    if (!loading && !currentUser) {
        return <Navigate to="/login" replace />;
    }


    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Auto-close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-bg-secondary dark:bg-bg-primary transition-colors duration-300">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={cn(
                    "hidden lg:flex flex-col border-r border-[#0d3d46] bg-sit-dark text-white fixed inset-y-0 z-40 transition-all duration-300 shadow-2xl",
                    isSidebarCollapsed ? "w-[80px]" : "w-[280px]"
                )}
            >
                <div className={cn("flex flex-col flex-shrink-0 transition-all duration-300", isSidebarCollapsed ? "pt-6 pb-2 items-center gap-4" : "h-20 px-6 justify-center")}>
                    {isSidebarCollapsed ? (
                        <>
                            <div className="flex justify-center w-full">
                                <Logo collapsed={true} animate={false} />
                            </div>
                            <button onClick={() => setIsSidebarCollapsed(false)} className="p-1.5 rounded-xl bg-sit-orange text-white hover:bg-sit-orange/90 transition-colors shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <Logo collapsed={false} animate={false} />
                            <button onClick={() => setIsSidebarCollapsed(true)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {!isSidebarCollapsed && (
                        <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Main
                        </div>
                    )}
                    <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={isSidebarCollapsed} />
                    {isSuperAdmin && (
                        <SidebarLink to="/admin" icon={Shield} label="Admin Panel" collapsed={isSidebarCollapsed} />
                    )}

                    {!isSidebarCollapsed && (
                        <div className="px-4 mt-8 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Settings
                        </div>
                    )}
                    <ProfileSidebarLink to="/profile" collapsed={isSidebarCollapsed} />

                    <button
                        onClick={handleLogout}
                        title={isSidebarCollapsed ? "Logout" : undefined}
                        className={cn(
                            "w-full flex items-center gap-3 py-3 mt-4 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-300 group",
                            isSidebarCollapsed ? "justify-center px-0 mx-2" : "px-4"
                        )}
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
                        {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </nav>

                <div className={cn("p-4 border-t border-[#0d3d46] bg-black/10 flex flex-col gap-4", isSidebarCollapsed ? "items-center" : "")}>
                    <div className={cn("flex", isSidebarCollapsed ? "justify-center" : "justify-center w-full")}>
                        <ThemeToggle collapsed={isSidebarCollapsed} />
                    </div>
                    <ProfileDropdown collapsed={isSidebarCollapsed} />
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border-color z-40 flex items-center justify-between px-4">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
                <Logo collapsed animate={false} />
                <div className="flex items-center gap-3">
                    <NotificationPanel />
                    <ProfileDropdown collapsed={true} />
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden fixed inset-0 top-16 bg-white dark:bg-slate-950 z-30 p-6 flex flex-col gap-4"
                    >
                        <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                        {isSuperAdmin && (
                            <SidebarLink to="/admin" icon={Shield} label="Admin Panel" />
                        )}
                        <ProfileSidebarLink to="/profile" />
                        
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 mt-4">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Theme</span>
                            <ThemeToggle />
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <motion.main className={cn("flex-1 pt-16 lg:pt-0 min-h-screen transition-all duration-300 bg-white dark:bg-[#01161a]", isSidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[280px]")}>
                <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Outlet />
                </div>
            </motion.main>
        </div>
    );
};

export default AppLayout;
