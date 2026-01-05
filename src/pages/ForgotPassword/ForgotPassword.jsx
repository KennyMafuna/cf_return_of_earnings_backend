import styles from "../Register/Register.module.scss";
import WhiteLogo from "../../assets/images/white-logo.png";
import Navigation from "../../components/layout/Navigation/Navigation";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import { useState, useRef, useCallback } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../../contexts/AuthContext";

const ForgotPassword = () => {
    const [idNumber, setIdNumber] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [checkingMessage, setCheckingMessage] = useState('');
    const [color, setColor] = useState('');
    const [recaptchaValue, setRecaptchaValue] = useState(null);
    const [recaptchaKey, setRecaptchaKey] = useState(0);
    const [userVerified, setUserVerified] = useState(false); // New state to track verification
    
    const recaptchaRef = useRef();
    const { checkUserExists, forgotPassword, loading, loadingMessage, error } = useAuth();
    
    const RECAPTCHA_SITE_KEY = "6LfjotorAAAAAMJ5Yj6hy7gQ_N1-Rb6_jMaYdzjz"; 

    const handleVerifyUser = async () => {
        if (!idNumber || !name || !surname) {
            setCheckingMessage('Please fill in all fields');
            setColor('red');
            return;
        }

        const idRegex = /^[0-9]{13}$/;
        if (!idRegex.test(idNumber)) {
            setCheckingMessage('ID number must be exactly 13 digits');
            setColor('red');
            return;
        }

        setCheckingMessage('Verifying user information...');
        setColor('blue');
        
        const result = await checkUserExists({ idNumber, name, surname });

        if (result.success) {
            setCheckingMessage('User verified successfully! Please complete the reCAPTCHA and submit to reset your password.');
            setColor('green');
            setUserVerified(true); // Set verified to true
        } else {
            setCheckingMessage(result.message || 'User verification failed. Please check your information and try again.');
            setColor('red');
            setUserVerified(false);
        }
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log("Password reset submission started");

        if (!userVerified) {
            setCheckingMessage('Please verify your information first');
            setColor('red');
            return;
        }

        if (!recaptchaValue) {
            setCheckingMessage('Please complete the reCAPTCHA verification');
            setColor('red');
            return;
        }

        setCheckingMessage('Processing password reset...');
        setColor('blue');
        
        const formData = {
            idNumber,
            name, 
            surname,
            recaptchaToken: recaptchaValue
        };

        console.log('Sending password reset data:', { ...formData });

        const result = await forgotPassword(formData);

        if (result.success) {
            setCheckingMessage(result.message || 'Password reset successful! Check your email for the new password.');
            setColor('green');
            
            // Reset form
            setIdNumber('');
            setName('');
            setSurname('');
            setUserVerified(false);
            resetRecaptcha();
        } else {
            setCheckingMessage(result.message || 'Password reset failed. Please try again.');
            setColor('red');
        }
    }
    
    const handleRecaptchaChange = useCallback((value) => {
        try {
            console.log("reCAPTCHA value received:", value ? "Yes" : "No");
            setRecaptchaValue(value);
        } catch (error) {
            console.error("reCAPTCHA change error:", error);
            setRecaptchaValue(null);
        }
    }, []);

    const handleRecaptchaErrored = useCallback(() => {
        console.log("reCAPTCHA errored");
        setRecaptchaValue(null);
        setCheckingMessage('reCAPTCHA failed to load. Please refresh the page.');
        setColor('red');
    }, []);
    
    const handleRecaptchaExpired = useCallback(() => {
        console.log("reCAPTCHA expired");
        setRecaptchaValue(null);
        setCheckingMessage('reCAPTCHA expired, please verify again');
        setColor('red');
    }, []);

    const resetRecaptcha = useCallback(() => {
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        setRecaptchaValue(null);
        setRecaptchaKey(prev => prev + 1);
    }, []);

    const handleFieldChange = (field, value) => {
        if (field === 'idNumber') setIdNumber(value);
        if (field === 'name') setName(value);
        if (field === 'surname') setSurname(value);
        
        if (userVerified) {
            setUserVerified(false);
            setCheckingMessage('Information changed. Please verify again.');
            setColor('blue');
            resetRecaptcha();
        }
    }

    useState(() => {
        if (loading && loadingMessage) {
            setCheckingMessage(loadingMessage);
            setColor('blue');
        }
    }, [loading, loadingMessage]);

    useState(() => {
        if (error) {
            setCheckingMessage(error.message);
            setColor('red');
        }
    }, [error]);

    return (
        <div className={styles.mainRegisterContainer}>
            <div className={styles.leftContainer}>
                <img className={styles.whiteLogo} src={WhiteLogo} alt="Logo" />
                <div className={styles.navigationContainer}>
                    <Navigation className={styles.Navigation} />
                </div>
                <h1>Password Reset Instructions</h1>
                <ul>
                    <li>Enter your RSA ID number, First Names and Surname</li>
                    <li>Click "Verify Information" to confirm your identity</li>
                    <li>Complete reCAPTCHA verification</li>
                    <li>Click "Reset Password" to submit your request</li>
                    <li>Check your registered email for the new auto-generated password</li>
                </ul>
            </div>
            
            <div className={styles.rightContainer}>
                <h1>Password Reset</h1>
                <h2>Reset Your DOL Access Password</h2>
                
                <div className={styles.inputGroupOne}>
                    <Input
                        type="text"
                        placeholder="ID Number:"
                        required={true}
                        value={idNumber}
                        onChange={(e) => handleFieldChange('idNumber', e.target.value)}
                        size="full"
                        theme="dark"
                        disabled={loading}
                    />
                    <Input
                        type="text"
                        placeholder="Name:"
                        required={true}
                        value={name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        size="full"
                        theme="dark"
                        disabled={loading}
                    />
                    <Input
                        type="text"
                        placeholder="Surname:"
                        required={true}
                        value={surname}
                        onChange={(e) => handleFieldChange('surname', e.target.value)}
                        size="full"
                        theme="dark"
                        disabled={loading}
                    />
                </div>
                
                <div className={styles.confirmationButtonContainer}>
                    <p style={{ 
                        color: color, 
                        marginBottom: '1rem', 
                        fontWeight: 'bold',
                        minHeight: '1.5rem',
                        textAlign: 'center'
                    }}>
                        {checkingMessage}
                    </p>
                    
                    {!userVerified ? (
                        <Button
                            variant="secondary" 
                            size="full"
                            onClick={handleVerifyUser}
                            disabled={!idNumber || !name || !surname || loading}
                        >
                            {loading && loadingMessage.includes('Verifying') ? 'Verifying...' : 'Verify Information'}
                        </Button>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.verifiedForm}>
                            <div className={styles.recaptchaContainer}>
                                <ReCAPTCHA
                                    key={recaptchaKey}
                                    ref={recaptchaRef}
                                    sitekey={RECAPTCHA_SITE_KEY}
                                    onChange={handleRecaptchaChange}
                                    onExpired={handleRecaptchaExpired}
                                    onErrored={handleRecaptchaErrored}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="secondary"
                                size="full"
                                disabled={loading || !recaptchaValue} 
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword;