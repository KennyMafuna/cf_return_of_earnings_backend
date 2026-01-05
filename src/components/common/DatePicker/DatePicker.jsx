import React, { useState, useRef, useEffect } from 'react';
import styles from './DatePicker.module.scss';

const DatePicker = ({ 
    placeholder = '', 
    value = '', 
    onChange, 
    size = 'medium', 
    theme = 'light',
    disabled = false,
    error = false,
    required = false,
    errorMessage = '',
    minDate = '',
    maxDate = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value || '');
    const datePickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        onChange?.(date);
        setIsOpen(false);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSelectedDate(value);
        onChange?.(value);
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const inputClasses = [
        styles.input,
        styles[`input--${size}`],
        styles[`input--${theme}`], 
        error ? styles['input--error'] : '',
        disabled ? styles['input--disabled'] : '',
        styles.datePickerInput
    ].join(' ');

    const labelClasses = [
        styles.label,
        theme === 'dark' ? styles['label--dark'] : ''
    ].join(' ');

    return (
        <div className={styles.inputContainer} ref={datePickerRef}>
            <div className={styles.inputWrapper}>
                {theme !== 'dark' && (
                    <label htmlFor={`datepicker-${placeholder}`} className={labelClasses}>
                        {required && <span>*</span>} {placeholder}
                    </label>
                )}
                <div className={theme === 'dark' ? styles.inputFieldWrapperDark : styles.inputFieldWrapper}>
                    {theme === 'dark' && (
                        <label htmlFor={`datepicker-${placeholder}`} className={labelClasses}>
                            {required && <span>*</span>} {placeholder}
                        </label>
                    )}
                    
                    <div className={styles.datePickerWrapper}>
                        <input
                            id={`datepicker-${placeholder}`}
                            type="text"
                            value={selectedDate}
                            onChange={handleInputChange}
                            onFocus={() => setIsOpen(true)}
                            className={inputClasses}
                            disabled={disabled}
                            required={required}
                            placeholder="YYYY-MM-DD"
                        />
                        <button
                            type="button"
                            className={styles.datePickerToggle}
                            onClick={() => setIsOpen(!isOpen)}
                            disabled={disabled}
                        >
                            <i className="fa-solid fa-calendar"></i>
                        </button>
                    </div>

                    {isOpen && !disabled && (
                        <div className={styles.datePickerDropdown}>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                min={minDate}
                                max={maxDate}
                                className={styles.datePickerNative}
                            />
                            
                            <div className={styles.datePickerActions}>
                                <button
                                    type="button"
                                    className={styles.datePickerTodayButton}
                                    onClick={() => handleDateChange(getTodayDate())}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    className={styles.datePickerClearButton}
                                    onClick={() => handleDateChange('')}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {error && errorMessage && (
                <span className={styles.errorMessage}>{errorMessage}</span>
            )}
        </div>
    );
};

export default DatePicker;