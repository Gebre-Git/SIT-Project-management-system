import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
    className?: string;
    collapsed?: boolean;
    animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, collapsed = false, animate = true }) => {
    const { theme } = useTheme();

    const logoSrc = theme === 'dark' 
        ? "/src/assets/SIT SECONDARY LOGO SECONDARY COLOR (DARK BACKGROUND).png"
        : "/src/assets/SIT SECONDARY LOGO PRIMARY COLOR.png";

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
                className="relative flex items-center justify-center p-1 bg-white/10 dark:bg-white/5 rounded-xl backdrop-blur-sm transition-colors duration-300"
            >
                <img 
                    src={logoSrc}
                    alt="SIT Logo" 
                    className={cn(
                        "transition-all duration-300 object-contain",
                        collapsed ? "w-8 h-8" : "w-10 h-10"
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
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sit-orange via-sit-orange/80 to-sit-orange leading-none">
                        SIT Manager
                    </span>
                    <span className="text-[0.6rem] font-semibold text-sit-dark/60 dark:text-sit-half-baked/60 tracking-[0.2em] uppercase ml-0.5 mt-1">
                        Excellence in IT
                    </span>
                </motion.div>
            )}
        </Link>
    );
};

export default Logo;
