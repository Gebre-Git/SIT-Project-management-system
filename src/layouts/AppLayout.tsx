import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Menu, X, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Logo from '../components/Logo';
import ProfileDropdown from '../components/ProfileDropdown';
import ProfileAvatar from '../components/ProfileAvatar';
import ThemeToggle from '../components/ThemeToggle';
import NotificationPanel from '../components/NotificationPanel';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const SidebarLink = ({ to, icon: Icon, label, collapsed }: { to: string, icon: any, label: string, collapsed?: boolean }) => (
    <NavLink
        to={to}
        title={collapsed ? label : undefined}
        className={({ isActive }) => cn(
            "flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden",
            collapsed ? "justify-center p-2" : "gap-3 px-4 py-3",
            isActive
                ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 font-medium shadow-lg shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        )}
    >
        {({ isActive }) => (
            <>
                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110", isActive && "fill-current opacity-100")} />
                {!collapsed && <span className="relative z-10 whitespace-nowrap overflow-hidden">{label}</span>}
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
                "flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden",
                collapsed ? "justify-center p-2" : "gap-3 px-4 py-2.5",
                isActive
                    ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 font-medium shadow-lg shadow-blue-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
        >
            {({ isActive }) => (
                <>
                    <ProfileAvatar
                    photoURL={currentUser?.photoURL}
                    displayName={currentUser?.displayName}
                    size={collapsed ? 'md' : 'sm'}
                    className={cn(
                        "transition-all duration-300",
                        isActive ? "ring-2 ring-white/50" : (collapsed ? "ring-2 ring-blue-500/20 group-hover:ring-blue-500/50" : "group-hover:ring-blue-500/30"),
                        collapsed && "scale-110 shadow-lg shadow-blue-500/10"
                    )}
                />
                {!collapsed && (
                    <div className="flex flex-col min-w-0 flex-1">
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
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

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
                initial={false}
                animate={{ 
                    width: isSidebarCollapsed ? 80 : 260,
                    x: 0,
                    opacity: 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden lg:flex flex-col border-r border-border-color bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl fixed inset-y-0 z-40 overflow-hidden"
            >
                <div className={cn("h-20 flex items-center justify-between", isSidebarCollapsed ? "px-4 pt-4 flex-col gap-4 h-auto" : "px-6")}>
                    <div className={cn("flex items-center gap-3 overflow-hidden", isSidebarCollapsed && "justify-center w-full")}>
                        <Logo collapsed={isSidebarCollapsed} />
                    </div>
                    {!isSidebarCollapsed && (
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {isSidebarCollapsed && (
                    <div className="py-2 flex justify-center">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                <nav className={cn("flex-1 py-6 space-y-4 transition-all duration-300", isSidebarCollapsed ? "px-2" : "px-4")}>
                    {!isSidebarCollapsed && (
                        <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Main
                        </div>
                    )}
                    <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={isSidebarCollapsed} />

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
                            "w-full flex items-center text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-300 group",
                            isSidebarCollapsed ? "justify-center p-3 h-12" : "gap-3 px-4 py-3 mt-4"
                        )}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                        {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">Logout</span>}
                    </button>
                </nav>

                <div className={cn("mt-auto space-y-6 border-t border-border-color bg-white/30 dark:bg-slate-900/30 transition-all duration-300", isSidebarCollapsed ? "p-2" : "p-4")}>
                    <div className="flex justify-center">
                        <ThemeToggle collapsed={isSidebarCollapsed} />
                    </div>
                    <div className={cn("flex flex-col items-center gap-3", !isSidebarCollapsed && "px-2 items-start")}>
                        <ProfileDropdown collapsed={isSidebarCollapsed} />
                    </div>
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
                    <ThemeToggle />
                    <ProfileDropdown />
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
                        <ProfileSidebarLink to="/profile" />
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
            <motion.main 
                initial={false}
                animate={{ 
                    paddingLeft: window.innerWidth >= 1024 ? (isSidebarCollapsed ? 80 : 260) : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1 pt-16 lg:pt-0 min-h-screen"
            >
                <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Outlet />
                </div>
            </motion.main>
        </div>
    );
};

export default AppLayout;
