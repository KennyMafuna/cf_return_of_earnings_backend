import React, { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.scss';

const Dropdown = ({ 
  options = [],
  placeholder = 'Select an option',
  value = '',
  onChange,
  size = 'medium',
  theme = 'light',
  disabled = false,
  error = false,
  errorMessage = '',
  label = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  const dropdownClasses = [
    styles.dropdown,
    styles[`dropdown--${size}`],
    styles[`dropdown--${theme}`],
    error ? styles['dropdown--error'] : '',
    disabled ? styles['dropdown--disabled'] : '',
    isOpen ? styles['dropdown--open'] : ''
  ].join(' ');

  const triggerClasses = [
    styles.dropdownTrigger,
    styles[`dropdownTrigger--${size}`],
    styles[`dropdownTrigger--${theme}`],
    error ? styles['dropdownTrigger--error'] : '',
    disabled ? styles['dropdownTrigger--disabled'] : ''
  ].join(' ');

  const labelClasses = [
    styles.label,
    theme === 'dark' ? styles['label--dark'] : ''
  ].join(' ');

  return (
    <div className={styles.dropdownContainer}>
      <div className={styles.dropdownWrapper}>
        {theme !== 'dark' && label && (
          <label className={labelClasses}>
            {label}
          </label>
        )}
        
        <div className={theme === 'dark' ? styles.dropdownFieldWrapperDark : styles.dropdownFieldWrapper}>
          {theme === 'dark' && label && (
            <label className={labelClasses}>
              {label}
            </label>
          )}
          
          <div className={dropdownClasses} ref={dropdownRef}>
            <button
              type="button"
              className={triggerClasses}
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
            >
              <span className={styles.selectedValue}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} ${styles.chevron}`}></i>
            </button>

            {isOpen && (
              <div className={styles.dropdownMenu}>
                {options.map((option, index) => (
                  <div
                    key={option.value || index}
                    className={`${styles.dropdownItem} ${
                      value === option.value ? styles['dropdownItem--selected'] : ''
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </div>
                ))}
                
                {options.length === 0 && (
                  <div className={styles.dropdownItem}>
                    No options available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {error && errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
    </div>
  );
};

export default Dropdown;