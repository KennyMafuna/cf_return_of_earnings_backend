import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { useError } from './ErrorContext';
import { useLoading  } from './LoadingContext';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
    
    const { setError, clearAllErrors, setFieldError } = useError();
    const { startLoading, stopLoading } = useLoading();
    const navigate = useNavigate();
    
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');
            
            if (token && userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (err) {
                    console.error('Error initializing auth:', err);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                }
            }
            setInitialAuthCheckComplete(true);
            stopLoading();
        };
        
        initializeAuth();
    }, []);
    
    const login = async (credentials) => {
        startLoading('Signing you in...');
        clearAllErrors();
        
        try {
            const response = await authService.login(credentials);
            
            if (response.success) {
                const { user: userData, token } = response.data;
                
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setError('Login successful!', `Hello ${userData.name} ${userData.surname}`, 'success');

                return { success: true, data: response.data, user: userData };

            } else {
                if (response.message?.toLowerCase().includes('password')) {
                    setFieldError('password', response.message);
                } else if (response.message?.toLowerCase().includes('email') || response.message?.toLowerCase().includes('user')) {
                    setFieldError('username', response.message);
                } else {
                    setError(response.message, 'Login Failed');
                }
                
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            setError(message, 'Login Error');
            return { success: false };
        } finally {
            stopLoading();
        }
    };

    const logout = async () => {
        startLoading('Signing you out...');
        
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            stopLoading()
            setError('You have been logged out successfully', 'Logged Out', 'success');
            navigate('/signin');
        }
    };

    const register = async (userData) => {
        startLoading('Signing you up...');
        clearAllErrors();
        
        try {
            const response = await authService.register(userData);
            
            if (response.success) {
                setError(
                    response.message || 'Registration successful! Please check your email for the password.',
                    'Registration Complete',
                    'success'
                );
                navigate('/');
                
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Registration Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            setError(message, 'Registration Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const checkUserInfo = async (userInfo) => {
        startLoading('Checking your info...');
        clearAllErrors();
        
        try {
            const response = await authService.checkUserInfo(userInfo);
            
            if (response.success) {
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Verification Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Verification failed. Please try again.';
            setError(message, 'Verification Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const forgotPassword = async (userData) => { 
        startLoading('Processing password reset...');
        clearAllErrors();
        
        try {
            const response = await authService.forgotPassword(userData); 
            
            if (response.success) {
                setError(
                    response.message || 'Password reset successful! Check your email for the new password.',
                    'Password Reset Complete',
                    'success'
                );
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Password Reset Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Password reset request failed.';
            setError(message, 'Password Reset Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const resetPassword = async (resetData) => {
        startLoading("Updating your password")
        clearAllErrors();
        
        try {
            const response = await authService.resetPassword(resetData);
            
            if (response.success) {
                // Update user verification status after password reset
                if (user) {
                    const updatedUser = { ...user, isVerified: true };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
                
                setError('Password updated successfully!', 'Password Updated', 'success');
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Password Update Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Password reset failed.';
            setError(message, 'Password Update Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const checkUserExists = async (userData) => {
        startLoading("Verifying User info")
        clearAllErrors();
        
        try {
            const response = await authService.checkUserExists(userData);
            
            if (response.success) {
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Verification Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Verification failed. Please try again.';
            setError(message, 'Verification Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const value = {
        user,
        setUser,
        loading: !initialAuthCheckComplete,
        initialAuthCheckComplete,
        login,
        register,
        logout,
        checkUserInfo,
        forgotPassword,
        resetPassword,
        checkUserExists,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};