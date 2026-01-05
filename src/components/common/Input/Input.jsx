// Input.jsx
import React, { useState } from 'react';
import styles from './Input.module.scss';

const Input = ({ 
    type = 'text', 
    placeholder = '', 
    value = '', 
    onChange, 
    size = 'medium', 
    theme = 'light',
    password = false,
    disabled = false,
    error = false,
    required = false,
    errorMessage = '',
    maxLength
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = password ? (showPassword ? 'text' : 'password') : type;

    const inputClasses = [
        styles.input,
        styles[`input--${size}`],
        styles[`input--${theme}`], 
        error ? styles['input--error'] : '',
        disabled ? styles['input--disabled'] : '',
        password ? styles.inputWithToggle : '' 
    ].join(' ');

    const labelClasses = [
        styles.label,
        theme === 'dark' ? styles['label--dark'] : ''
    ].join(' ');
    
    return (
        <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
            {theme !== 'dark' && (
                <label htmlFor={`input-${placeholder}`} className={labelClasses}>
                    {required && <span>*</span>} {placeholder}
                </label>
            )}
            <div className={theme == 'dark' ? styles.inputFieldWrapperDark : styles.inputFieldWrapper}>
                {theme === 'dark' && (
                    <label htmlFor={`input-${placeholder}`} className={labelClasses}>
                        {required && <span>*</span>} {placeholder}
                    </label>
                )}
                <input
                    id={`input-${placeholder}`}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    className={inputClasses}
                    disabled={disabled}
                    required={required}
                    maxLength={maxLength}
                />
                {password && (
                <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                </button>
                )}
            </div>
            </div>
            {error && errorMessage && (
            <span className={styles.errorMessage}>{errorMessage}</span>
            )}
        </div>
    );
};

export default Input;