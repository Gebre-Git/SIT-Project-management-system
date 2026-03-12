import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfirmConfig } from '../types/confirm';

interface CustomConfirmProps {
    config: ConfirmConfig | null;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const CustomConfirm: React.FC<CustomConfirmProps> = ({ config, isOpen, onConfirm, onCancel }) => {
    if (!config) return null;

    const type = config.type || 'warning';

    const icons = {
        danger: <AlertTriangle className="w-6 h-6 text-red-500" />,
        warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
        info: <HelpCircle className="w-6 h-6 text-blue-500" />
    };

    const backgrounds = {
        danger: 'bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/20',
        warning: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/20',
        info: 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/20'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={cn(
                            "relative z-10 max-w-sm w-full p-8 rounded-[2.5rem] border backdrop-blur-xl shadow-2xl overflow-hidden",
                            backgrounds[type]
                        )}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] blur-3xl -mr-16 -mt-16" />

                        <div className="flex flex-col items-center text-center">
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mb-6">
                                {icons[type]}
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {config.title}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
                                {config.message}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {config.cancelLabel || 'Cancel'}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={cn(
                                        "flex-1 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95",
                                        type === 'danger' ? "bg-red-600 shadow-red-600/20 hover:bg-red-700" :
                                            type === 'warning' ? "bg-amber-500 shadow-amber-500/20 hover:bg-amber-600" :
                                                "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
                                    )}
                                >
                                    {config.confirmLabel || 'Confirm'}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CustomConfirm;
