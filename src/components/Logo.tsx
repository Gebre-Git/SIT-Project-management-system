import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface LogoProps {
    className?: string;
    collapsed?: boolean;
    animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, collapsed = false, animate = true }) => {
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
                className="relative flex items-center justify-center p-1 bg-white rounded-xl shadow-lg ring-1 ring-slate-200/50"
            >
                <img 
                    src="/src/assets/sit_logo.png" 
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
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-100 to-white leading-none">
                        SIT Manager
                    </span>
                    {/*<span className="text-[0.6rem] font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase ml-0.5">
                        by Barkot Labs
                    </span>*/}
                </motion.div>
            )}
        </Link>
    );
};

export default Logo;
