import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert, { AlertType } from '../components/CustomAlert';
import CustomConfirm from '../components/CustomConfirm';
import { ConfirmConfig } from '../types';

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

    const [confirmState, setConfirmState] = useState<{
        config: ConfirmConfig | null;
        resolve: ((value: boolean) => void) | null;
        isOpen: boolean;
    }>({
        config: null,
        resolve: null,
        isOpen: false
    });

    const showAlert = useCallback((message: string, type: AlertType = 'info') => {
        setAlert({ message, type, isOpen: true });
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(prev => ({ ...prev, isOpen: false }));
    }, []);

    const showConfirm = useCallback((config: ConfirmConfig) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({ config, resolve, isOpen: true });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (confirmState.resolve) confirmState.resolve(true);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    }, [confirmState.resolve]);

    const handleCancel = useCallback(() => {
        if (confirmState.resolve) confirmState.resolve(false);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    }, [confirmState.resolve]);

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <CustomAlert
                message={alert.message}
                type={alert.type}
                isOpen={alert.isOpen}
                onClose={hideAlert}
            />
            {confirmState.config && (
                <CustomConfirm
                    config={confirmState.config}
                    isOpen={confirmState.isOpen}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
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
