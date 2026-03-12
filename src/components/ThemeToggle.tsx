import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ThemeToggleProps {
    collapsed?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ collapsed = false }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center transition-all duration-500 overflow-hidden",
                collapsed ? "w-8 h-14 flex-col gap-2" : "w-14 h-7"
            )}
            aria-label="Toggle Theme"
        >
            <motion.div
                layout
                initial={false}
                animate={collapsed ? { y: theme === 'dark' ? 28 : 0 } : { x: theme === 'dark' ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="z-10 w-5 h-5 rounded-full bg-white dark:bg-blue-500 shadow-sm flex items-center justify-center flex-shrink-0"
            >
                <AnimatePresence mode="wait">
                    {theme === 'light' ? (
                        <motion.div
                            key="sun"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                        >
                            <Sun className="w-3 h-3 text-amber-500" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="moon"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                        >
                            <Moon className="w-3 h-3 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Background decorative elements */}
            <div className={cn(
                "absolute inset-0 flex justify-between px-2 items-center pointer-events-none opacity-40 dark:opacity-20 transition-opacity",
                collapsed ? "flex-col py-2 px-0" : "flex-row"
            )}>
                <Sun className="w-3 h-3 text-amber-500" />
                <Moon className="w-3 h-3 text-slate-400" />
            </div>
        </button>
    );
};

export default ThemeToggle;
