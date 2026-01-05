import Input from "../../components/common/Input/Input";
import { useAuth } from "../../contexts/AuthContext";
import { useError } from "../../contexts/ErrorContext";
import styles from "./PasswordChange.module.scss";
import WhiteLogo from "../../assets/images/white-logo.png";
import { useState } from "react";
import Button from "../../components/common/Button/Button";
import { useNavigate } from "react-router-dom";

const PasswordChange = () => {
    const { user, resetPassword, loading, loadingMessage } = useAuth();
    const { setFieldError, getFieldError, hasFieldError, clearFieldError, clearAllErrors } = useError();
    const navigate = useNavigate();
    
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [success, setSuccess] = useState(false);

    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 10,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numeric: /[0-9]/.test(password),
            nonAlphaNumeric: /[^A-Za-z0-9]/.test(password)
        };

        if (!requirements.length) return "Password must be at least 10 characters long";
        if (!requirements.uppercase) return "Password must contain at least one uppercase letter (A-Z)";
        if (!requirements.lowercase) return "Password must contain at least one lowercase letter (a-z)";
        if (!requirements.numeric) return "Password must contain at least one number (0-9)";
        if (!requirements.nonAlphaNumeric) return "Password must contain at least one special character (e.g., !@#$%^&*()_+-=)";
        
        return "";
    };

    const handleNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        
        if (hasFieldError('newPassword')) {
            clearFieldError('newPassword');
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        
        if (hasFieldError('confirmPassword')) {
            clearFieldError('confirmPassword');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearAllErrors();

        let hasError = false;

        // Validate new password
        if (!newPassword) {
            setFieldError('newPassword', "Password is required");
            hasError = true;
        } else {
            const passwordError = validatePassword(newPassword);
            if (passwordError) {
                setFieldError('newPassword', passwordError);
                hasError = true;
            }
        }

        // Validate confirm password
        if (!confirmPassword) {
            setFieldError('confirmPassword', "Please confirm your password");
            hasError = true;
        } else if (newPassword !== confirmPassword) {
            setFieldError('confirmPassword', "Passwords do not match");
            hasError = true;
        }

        if (hasError) return;

        try {
            const resetData = {
                email: user.email,
                newPassword: newPassword
            };

            const result = await resetPassword(resetData);
            
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
        } catch (error) {
            console.error('Password change error:', error);
        }
    };

    if (success) {
        return (
            <div className={styles.mainPasswordChangeContainer}>
                <div className={styles.logoContainer}>
                    <img className={styles.whiteLogo} src={WhiteLogo} alt="Logo" />
                </div>
                <div className={styles.successContainer}>
                    <h1>Password Changed Successfully!</h1>
                    <p>Your password has been updated. Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.mainPasswordChangeContainer}>
            <div className={styles.logoContainer}>
                <img className={styles.whiteLogo} src={WhiteLogo} alt="Logo" />
            </div>
            <form onSubmit={handleSubmit}>
                <h1>Welcome to the Online Submissions</h1>
                <h2>Change Your Password</h2>
                <p className={styles.instruction}>
                    Please set a new password for your account.
                    Your password must include uppercase letters, lowercase letters, numbers, and special characters.
                </p>
                
                <Input
                    type="text"
                    placeholder="Username:"
                    value={user?.idNumber || ''}
                    size="full"
                    theme="dark"
                    disabled={true}
                />
                <Input
                    type="text"
                    placeholder="Name:"
                    value={user?.name || ''}
                    size="full"
                    theme="dark"
                    disabled={true}
                />
                <Input
                    type="text"
                    placeholder="Surname:"
                    value={user?.surname || ''}
                    size="full"
                    theme="dark"
                    disabled={true}
                />
                <Input
                    type="password"
                    placeholder="New Password:"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    size="full"
                    theme="dark"
                    password={true}
                    error={hasFieldError('newPassword')}
                    errorMessage={getFieldError('newPassword')}
                />
                <Input
                    type="password"
                    placeholder="Confirm New Password:"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    size="full"
                    theme="dark"
                    password={true}
                    error={hasFieldError('confirmPassword')}
                    errorMessage={getFieldError('confirmPassword')}
                />
                
                <Button
                    type="submit"
                    variant="secondary"
                    size="full"
                    disabled={loading}
                >
                    {loading ? loadingMessage : 'Submit Password'}
                </Button>
            </form>
        </div>
    );
};

export default PasswordChange;