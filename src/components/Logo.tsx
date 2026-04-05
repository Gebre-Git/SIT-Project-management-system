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
                        collapsed ? "w-16 h-16" : "w-32 h-32"
                    )}
                />
            </motion.div>
        </Link>
    );
};

export default Logo;
