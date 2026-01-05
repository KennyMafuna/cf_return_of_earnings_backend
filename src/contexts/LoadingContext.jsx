// LoadingContext.jsx
import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const timeoutRef = useRef(null);

    const startLoading = useCallback((message = '') => {
        setLoading(true);
        setLoadingMessage(message);
    }, []);

    const stopLoading = useCallback(() => {
        clearTimeout(); 
        
        timeoutRef.current = setTimeout(() => {
            setLoading(false);
            setLoadingMessage('');
            timeoutRef.current = null;
        }, 2000);
    }, [clearTimeout]);

    const setLoadingWithMessage = useCallback((isLoading, message = '') => {
        setLoading(isLoading);
        setLoadingMessage(message);
    }, []);

    const value = {
        loading,
        loadingMessage,
        startLoading,
        stopLoading,
        setLoading: setLoadingWithMessage
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};