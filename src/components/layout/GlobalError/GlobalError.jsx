import { useError } from '../../../contexts/ErrorContext';
import styles from './GlobalError.module.scss';

const GlobalError = () => {
    const { error, clearError } = useError();

    if (!error) return null;

    return (
        <div 
            className={`${styles.globalError} ${styles[error.type]}`}
            onClick={clearError}
        >
            <div className={styles.errorContent}>
                <strong>{error.title}</strong>
                <span>{error.message}</span>
            </div>
            <button className={styles.closeButton} onClick={clearError}>
                ×
            </button>
        </div>
    );
};

export default GlobalError;