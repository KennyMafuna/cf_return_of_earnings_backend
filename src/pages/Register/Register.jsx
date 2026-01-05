import styles from "./Register.module.scss";
import WhiteLogo from "../../assets/images/white-logo.png";
import Navigation from "../../components/layout/Navigation/Navigation";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import { useState, useRef, useCallback, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
    const [idNumber, setIdNumber] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [telephoneNumber, setTelephoneNumber] = useState('');
    const [checkingMessage, setCheckingMessage] = useState('');
    const [color, setColor] = useState('');
    const [otherFields, setOtherFields] = useState(false);
    const [recaptchaValue, setRecaptchaValue] = useState(null);
    const [recaptchaKey, setRecaptchaKey] = useState(0);
    
    const recaptchaRef = useRef();
    const { checkUserInfo, register, loading, loadingMessage, error } = useAuth();

    const RECAPTCHA_SITE_KEY = "6LfjotorAAAAAMJ5Yj6hy7gQ_N1-Rb6_jMaYdzjz"; 

    const handleCheck = async () => {
        if (!idNumber || !name || !surname) {
            setCheckingMessage('Please fill in all fields');
            setColor('red');
            return;
        }

        // Validate ID number format
        const idRegex = /^[0-9]{13}$/;
        if (!idRegex.test(idNumber)) {
            setCheckingMessage('ID number must be exactly 13 digits');
            setColor('red');
            return;
        }

        // Clear any previous errors
        // clearError();
        setCheckingMessage('Checking user information...');
        setColor('blue');
        
        const result = await checkUserInfo({ idNumber, name, surname });

        if (result.success) {
            setCheckingMessage('ID Number validated! Please complete the form below.');
            setColor('green');
            setOtherFields(true);
        } else {
            setCheckingMessage(result.message || 'User information validation failed');
            setColor('red');
        }
    }

    const resetRecaptcha = useCallback(() => {
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        setRecaptchaValue(null);
        setRecaptchaKey(prev => prev + 1);
    }, []);

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
        setRecaptchaValue(null);
        setCheckingMessage('reCAPTCHA failed to load. Please refresh the page.');
        setColor('red');
    }, []);

    const handleRecaptchaExpired = useCallback(() => {
        setRecaptchaValue(null);
        resetRecaptcha();
        setCheckingMessage('reCAPTCHA expired, please verify again');
        setColor('red');
    }, [resetRecaptcha]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log("Form submission started");

        if (!email || !phoneNumber) {
            setCheckingMessage('Please fill in all required fields');
            setColor('red');
            return;
        }

        // if (!recaptchaValue) {
        //     setCheckingMessage('Please complete the reCAPTCHA verification');
        //     setColor('red');
        //     return;
        // }

        // Clear previous errors
        // clearError();
        setCheckingMessage('Submitting registration...');
        setColor('blue');
        
        const formData = {
            idNumber,
            name, 
            surname,
            email,
            phoneNumber,
            telephoneNumber: telephoneNumber || '',
            // recaptchaToken: recaptchaValue
        };

        console.log('Sending registration data:', { ...formData});

        const result = await register(formData);

        if (result.success) {
            setCheckingMessage('Registration successful! Check your email for the password.');
            setColor('green');
            
            // Reset form
            setIdNumber('');
            setName('');
            setSurname('');
            setEmail('');
            setPhoneNumber('');
            setTelephoneNumber('');
            setOtherFields(false);
            resetRecaptcha();
        } else {
            setCheckingMessage(result.message || 'Registration failed. Please try again.');
            setColor('red');
        }
    }

    // Update checking message based on context loading
    useEffect(() => {
        if (loading && loadingMessage) {
            setCheckingMessage(loadingMessage);
            setColor('blue');
        }
    }, [loading, loadingMessage]);

    // Update checking message based on context error
    useEffect(() => {
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
                <h1>Online User registration Instructions</h1>
                <ul>
                    <li> Enter the RSA ID number, First Name, Surname and click the "Confirm Information" button. </li>
                    <li>Complete the rest of the fields.</li>
                    <li>Verify if your email address is correct, as your password will be sent to it.</li>
                    <li>Click the submit button to send your application <br/> (to be a new CF- online User).</li>
                </ul>
            </div>
            
            <div className={styles.rightContainer}>
                <h1>Welcome to the Online Submissions</h1>
                <h2>Register For DOL Access</h2>
                
                <div className={styles.inputGroupOne}>
                    <Input
                        type="text"
                        placeholder="ID Number:"
                        required={true}
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        size="full"
                        theme="dark"
                        disabled={loading}
                    />
                    <Input
                        type="text"
                        placeholder="Name:"
                        required={true}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        size="full"
                        theme="dark"
                        disabled={loading}
                    />
                    <Input
                        type="text"
                        placeholder="Surname:"
                        required={true}
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
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
                    <Button
                        variant="secondary" 
                        size="full"
                        onClick={handleCheck}
                        disabled={!idNumber || !name || !surname || loading}
                    >
                        {loading && loadingMessage && loadingMessage.includes('Checking') ? 'Checking...' : 'Confirm Information'}
                    </Button>
                </div>

                {otherFields && (
                    <form onSubmit={handleSubmit} className={styles.inputGroupTwo}>
                        <Input
                            type="email"
                            placeholder="Email Address:"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            size="full"
                            theme="dark"
                            required
                            disabled={loading}
                        />
                        <Input
                            type="tel"
                            placeholder="Mobile Number:"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            size="full"
                            theme="dark"
                            required
                            disabled={loading}
                        />
                        <Input
                            type="tel"
                            placeholder="Telephone Number (Optional):"
                            value={telephoneNumber}
                            onChange={(e) => setTelephoneNumber(e.target.value)}
                            size="full"
                            theme="dark"
                            disabled={loading}
                        />
                        
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
                            disabled={loading }
                        >
                            {loading ? 'Submitting...' : 'Complete Registration'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Register;