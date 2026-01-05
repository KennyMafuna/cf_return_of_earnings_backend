import React, { useRef, useState } from 'react';
import styles from './fileInput.module.scss';

const FileInput = ({ 
  placeholder = 'Choose file',
  onChange,
  size = 'medium',
  theme = 'light',
  disabled = false,
  error = false,
  errorMessage = '',
  accept = '.pdf,.tif',
  multiple = false
}) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFiles = multiple ? Array.from(files) : [files[0]];
      
      // Validate file types
      const validFiles = selectedFiles.filter(file => {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        return fileExtension === 'pdf' || fileExtension === 'ttf';
      });

      if (validFiles.length > 0) {
        setFileName(validFiles.map(file => file.name).join(', '));
        onChange?.(multiple ? validFiles : validFiles[0]);
      } else {
        setFileName('');
        onChange?.(null);
        // You might want to show an error here
      }
    }
  };

  // Handle drag and drop events
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        fileInput.files = files;
        handleFileChange({ target: { files } });
      }
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Clear selected file
  const handleClear = () => {
    setFileName('');
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const inputClasses = [
    styles.input,
    styles[`input--${size}`],
    styles[`input--${theme}`],
    error ? styles['input--error'] : '',
    disabled ? styles['input--disabled'] : '',
    dragOver ? styles['input--drag-over'] : ''
  ].join(' ');

  const labelClasses = [
    styles.label,
    theme === 'dark' ? styles['label--dark'] : ''
  ].join(' ');

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputWrapper}>
        {theme !== 'dark' && (
          <label htmlFor={`file-input-${placeholder}`} className={labelClasses}>
            {placeholder}
          </label>
        )}
        
        <div 
          className={theme === 'dark' ? styles.inputFieldWrapperDark : styles.inputFieldWrapper}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {theme === 'dark' && (
            <label htmlFor={`file-input-${placeholder}`} className={labelClasses}>
              {placeholder}
            </label>
          )}
          
          {/* Hidden file input */}
          <input
            id={`file-input-${placeholder}`}
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className={inputClasses}
            disabled={disabled}
            style={{ display: 'none' }}
          />
          
          {/* Custom file input display */}
          <div className={styles.fileInputDisplay}>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={disabled}
              className={styles.fileInputButton}
            >
              Choose File
            </button>
            
            <span className={styles.fileName}>
              {fileName || 'No file chosen'}
            </span>
            
            {fileName && (
              <button
                type="button"
                onClick={handleClear}
                className={styles.clearButton}
                disabled={disabled}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
      
      {error && errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
      
      <div className={styles.fileTypeHint}>
        Accepted formats: pdf, .tif
      </div>
    </div>
  );
};

export default FileInput;