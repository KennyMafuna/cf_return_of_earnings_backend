import WhiteLogo from "../../assets/images/white-logo.png";
import Navigation from "../../components/layout/Navigation/Navigation";
import styles from "./Home.module.scss"
import Input from "../../components/common/Input/Input";
import { useState } from "react";
import Button from "../../components/common/Button/Button";
import { useNavigate, useNavigation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Home = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rightShowing, setRightShowing] = useState(true);
    const [errors, setErrors] = useState({
        username: "",
        password: ""
    });
    
    const { login, loading, error, clearError, user } = useAuth();
    const navigate = useNavigate();

    const validateUsername = (username) => {
        if (!username) {
            return "Username is required";
        }
        
        const idRegex = /^[0-9]{13}$/;
        if (!idRegex.test(username)) {
            return "Username must be exactly 13 numeric digits";
        }
        
        return "";
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        setErrors({
            username: "",
            password: ""
        });
        
        const usernameError = validateUsername(username);
        if (usernameError) {
            setErrors(prev => ({
                ...prev,
                username: usernameError
            }));
            return;
        }

        const result = await login({ username: username, password });
        
        if (result.success) {
            // Use the user data from the response, not from context
            if (result.user?.isVerified) {
                navigate('/')
                return
            }
            navigate('/password-change')
        } else {
            if (result.message?.toLowerCase().includes('password') || 
                result.message?.toLowerCase().includes('invalid')) {
                setErrors(prev => ({
                    ...prev,
                    password: result.message
                }));
            }
        }
    };

    const handleForgotPassword = () => {
        if (!username) {
            navigate('/forgotpassword');
            return;
        }
        navigate('/forgotpassword', { state: { email: username } });
    };

    const handleNavigation = (path) => {
        navigate(path);
    }

    const handleUsernameChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 13); // Only allow digits and limit to 13 characters
        setUsername(value);

        if (errors.username) {
            setErrors(prev => ({
                ...prev,
                username: ""
            }));
        }

        if (error) clearError();
    }

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        
        if (errors.password) {
            setErrors(prev => ({
                ...prev,
                password: ""
            }));
        }
        
        if (error) clearError();
    }

    return (
        <div className={styles.mainContainer}>
            <div className={rightShowing ? `${styles.leftContainer}` : `${styles.leftContainer} ${styles.leftContainerFull}`}>
                <img className={styles.whiteLogo} src={WhiteLogo} alt="DOL Logo" />
                <div className={styles.navigationContainer}>
                    <Navigation className={styles.Navigation}/>
                </div>
                
                {error && !errors.username && !errors.password && (
                    <div className={`${styles.errorMessage} ${error.type === 'success' ? styles.successMessage : ''}`}>
                        <strong>{error.title}:</strong> {error.message}
                    </div>
                )}
                
                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                        <Input
                            type="text"
                            placeholder="Username:"
                            value={username}
                            onChange={handleUsernameChange}
                            size="full"
                            disabled={loading}
                            autoComplete="username"
                            error={!!errors.username}
                            errorMessage={errors.username}
                            maxLength={13}
                        />
                        <Input
                            password={true}
                            placeholder="Password:"
                            value={password}
                            onChange={handlePasswordChange}
                            size="full"
                            disabled={loading}
                            autoComplete="current-password"
                            error={!!errors.password}
                            errorMessage={errors.password}
                        />
                    </div>
                    
                    <div className={styles.buttonGroup}>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            size="full"
                            disabled={loading || !username || !password}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                        
                        <Button 
                            variant="tertiary" 
                            size="full"
                            onClick={handleForgotPassword}
                            disabled={loading}
                            type="button"
                        >
                            Forgot Password
                        </Button>
                        
                        <Button 
                            variant="tertiary" 
                            size="full"
                            onClick={() => handleNavigation('/register')}
                            disabled={loading}
                            type="button"
                        >
                            Register
                        </Button>
                        
                        <Button 
                            variant="tertiary" 
                            size="full"
                            onClick={() => handleNavigation('/help')}
                            disabled={loading}
                            type="button"
                        >
                            Help
                        </Button>
                    </div>
                </form>
            </div>
            <button 
                onClick={() => setRightShowing(!rightShowing)} 
                className={!rightShowing ? `${styles.toggleButton} ${styles.toggleButtonActive}` : `${styles.toggleButton}`}
                disabled={loading}
            >
                {rightShowing ? 'Hide' : 'Show'}
            </button>
            
            {rightShowing && (
                <div className={styles.rightContainer}>
                    <h1>Online Submission Portal</h1>
                    <h2>Employer Registration</h2>
                    <p>Have you appointed 1 or more employees? You are required to register with Compensation Fund to take insurance cover against your employees in the event of injuries and diseases in your workplace.
                    <br/> <br/>You are required to notify us of the change of the nature of business within 7 days.
                    The Compensation Fund will issue a CF Registration number starting with 99…… (12 digits) to be used for payment's reference number or enquiries.
                    <br/> <br/>Some other industries will be transferred to Mutual Associations (read further on Obligations of the Employers)</p>
                    
                    <h2>Return of Earnings</h2>
                    <p>The Return of Earnings (ROE) submission period will be open from 11 April – 30 June 2025.
                    The expiry date of all employer valid Letters of Good Standing is extended to 31 May 2025.
                    <br/><br/>Have you submitted your Return of Earnings (ROE)? To be in good standing, you are required to submit the Return of Earnings before the set deadline.
                    <br/><br/>It is against the law for failure to submit the ROEs and penalties will be charged.
                    <br/><br/>Payment must be made within 30 days to avoid interest.
                    <br/><br/>An application for the Revision of Assessment must be done within 30 calendar days of the Notice of Assessment/Invoice's date.
                    <br/><br/>A Letter of Good Standing will be issued on receipt of the full payment and can be verified online using the unique Certificate Number.
                    <br/><br/>You can report the forged Letter of Good Standing to cf-fraud@thehotline.co.za or 0800 234 432 or SMS 30916</p>
                </div>
            )}
        </div>
    )
}

export default Home;