import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import CustomAlert, { AlertType } from '../components/CustomAlert';
import CustomConfirm from '../components/CustomConfirm';
import { ConfirmConfig } from '../types/confirm';

interface AlertContextType {
    showAlert: (message: string, type?: AlertType) => void;
    showConfirm: (config: ConfirmConfig) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alert, setAlert] = useState<{ message: string, type: AlertType, isOpen: boolean }>({
        message: '',
        type: 'info',
        isOpen: false
    });

    const [confirm, setConfirm] = useState<{ config: ConfirmConfig | null, isOpen: boolean }>({
        config: null,
        isOpen: false
    });

    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const showAlert = useCallback((message: string, type: AlertType = 'info') => {
        setAlert({ message, type, isOpen: true });
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(prev => ({ ...prev, isOpen: false }));
    }, []);

    const showConfirm = useCallback((config: ConfirmConfig): Promise<boolean> => {
        setConfirm({ config, isOpen: true });
        return new Promise((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setConfirm(prev => ({ ...prev, isOpen: false }));
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = null;
        }
    }, []);

    const handleCancel = useCallback(() => {
        setConfirm(prev => ({ ...prev, isOpen: false }));
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = null;
        }
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <CustomAlert
                message={alert.message}
                type={alert.type}
                isOpen={alert.isOpen}
                onClose={hideAlert}
            />
            <CustomConfirm
                config={confirm.config}
                isOpen={confirm.isOpen}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
