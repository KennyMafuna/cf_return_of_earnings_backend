import React, { createContext, useState, useContext, useCallback } from 'react';

const ErrorContext = createContext();

export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearFieldError = useCallback((fieldName) => {
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    const clearAllFieldErrors = useCallback(() => {
        setFieldErrors({});
    }, []);

    const clearAllErrors = useCallback(() => {
        setError(null);
        setFieldErrors({});
    }, []);

    const setGlobalError = useCallback((message, title = 'Error', type = 'error', duration = 5000) => {
        setError({
            type,
            title,
            message,
            duration
        });

        if (duration > 0) {
            setTimeout(() => {
                clearError();
            }, duration);
        }
    }, [clearError]);

    const setFieldError = useCallback((fieldName, message) => {
        setFieldErrors(prev => ({
            ...prev,
            [fieldName]: message
        }));
    }, []);

    const setMultipleFieldErrors = useCallback((errors) => {
        setFieldErrors(prev => ({
            ...prev,
            ...errors
        }));
    }, []);

    const getFieldError = useCallback((fieldName) => {
        return fieldErrors[fieldName] || '';
    }, [fieldErrors]);

    const hasFieldError = useCallback((fieldName) => {
        return !!fieldErrors[fieldName];
    }, [fieldErrors]);

    const value = {
        error,
        setError: setGlobalError,
        clearError,
        fieldErrors,
        setFieldError,
        setMultipleFieldErrors,
        getFieldError,
        hasFieldError,
        clearFieldError,
        clearAllFieldErrors,
        

        clearAllErrors
    };

    return (
        <ErrorContext.Provider value={value}>
            {children}
        </ErrorContext.Provider>
    );
};