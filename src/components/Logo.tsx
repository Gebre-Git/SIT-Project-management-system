import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';

interface LogoProps {
    className?: string;
    collapsed?: boolean;
    animate?: boolean;
    forceDark?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, collapsed = false, animate = true, forceDark = false }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || forceDark;

    return (
        <Link
            to="/"
            className={cn(
                "flex items-center font-bold transition-all duration-300",
                collapsed ? "justify-center w-full" : "gap-2",
                className
            )}
        >
            <motion.div
                initial={animate ? { scale: 0.5, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 0.8
                }}
                className="relative flex items-center justify-center p-1 transition-all duration-500"
            >
                <img
                    src={isDark ? logoDark : logoLight}
                    alt="SIT Logo"
                    className={cn(
                        "transition-all duration-300 object-contain",
                        collapsed ? "w-10 h-10" : "w-12 h-12"
                    )}
                />
            </motion.div>

            {!collapsed && (
                <motion.div
                    initial={animate ? { opacity: 0, x: -10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col"
                >
                    <span className={cn(
                        "text-xl font-bold tracking-tight bg-clip-text text-transparent leading-none",
                        isDark
                            ? "bg-gradient-to-r from-white via-orange-100 to-white"
                            : "bg-gradient-to-r from-sit-dark via-sit-orange to-sit-dark"
                    )}>
                        SIT Manager
                    </span>
                </motion.div>
            )}
        </Link>
    );
};

export default Logo;
