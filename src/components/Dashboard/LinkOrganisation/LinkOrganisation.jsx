import { useState, useEffect } from "react";
import Button from "../../common/Button/Button"
import Input from "../../common/Input/Input"
import FileInput from "../../common/fileInput/fileInput"
import { useOrganisation } from "../../../contexts/OrganisationContext";
import { useError } from "../../../contexts/ErrorContext";
import styles from "./LinkOrganisation.module.scss";

const LinkOrganisation = () => {
    const [cfNumber, setCfNumber] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [step, setStep] = useState(1);
    const [linkedOrganisation, setLinkedOrganisation] = useState(null);
    const [signedForm, setSignedForm] = useState(null);
    
    const { 
        loading, 
        loadingMessage, 
        linkOrganisation, 
        uploadSignedForm 
    } = useOrganisation();
    
    const { setError, clearError } = useError();

    useEffect(() => {
        const savedState = localStorage.getItem('linkOrganisationState');
        if (savedState) {
            try {
                const { step: savedStep, cfregistrationNo, linkedOrganisation: savedOrganisation } = JSON.parse(savedState);
                setStep(savedStep);
                setCfNumber(cfregistrationNo);
                setLinkedOrganisation(savedOrganisation);
                setError(`Continue Linking with ${savedOrganisation.tradingName}`, 'Document Required', 'warning')
            } catch (error) {
                // console.error('Error parsing saved state:', error);
            }
        }
    }, []);

    const validateCfNumber = (number) => {
        const cleanNumber = number.replace(/\D/g, "");
        
        if (cleanNumber && !cleanNumber.startsWith("99")) {
            return "CF Number must start with '99'";
        }
        
        if (cleanNumber && cleanNumber.length !== 12) {
            return "CF Number must be exactly 12 digits";
        }
        
        if (cleanNumber && !/^\d+$/.test(cleanNumber)) {
            return "CF Number must contain only numbers";
        }
        
        return "";
    };

    const handleCfNumberChange = (value) => {
        const cleanValue = value.replace(/\D/g, "");
        setCfNumber(cleanValue);
        const validationError = validateCfNumber(cleanValue);
        
        if (validationError) {
            setError(validationError, 'Validation Error');
        } else {
            clearError();
        }
    };

    const formatCfNumber = (number) => {
        if (!number) return "";
        if (number.length <= 2) return number;
        if (number.length <= 6) return `${number.slice(0, 2)}-${number.slice(2)}`;
        if (number.length <= 10) return `${number.slice(0, 2)}-${number.slice(2, 6)}-${number.slice(6)}`;
        return `${number.slice(0, 2)}-${number.slice(2, 6)}-${number.slice(6, 10)}-${number.slice(10)}`;
    };

    const handleLink = async () => {
        const validationError = validateCfNumber(cfNumber);
        
        if (validationError) {
            setError(validationError, 'Validation Error');
            return;
        }
        
        if (!acceptedTerms) {
            setError('Please accept the Terms & Conditions', 'Terms Required');
            return;
        }
        
        clearError();
        
        const result = await linkOrganisation(cfNumber);
        
        if (result.success) {
            setLinkedOrganisation(result.data.organisation);
            setStep(2);
            localStorage.setItem('linkOrganisationState', JSON.stringify({
                step: 2,
                cfregistrationNo: cfNumber,
                linkedOrganisation: result.data.organisation
            }));
        }
    };

    const handleFormUpload = async () => {
        if (!signedForm) {
            setError('Please upload the signed authorization form', 'Form Required');
            return;
        }

        clearError();
        
        const result = await uploadSignedForm(linkedOrganisation.id, signedForm);
        
        if (result.success) {
            setStep(1);
            setCfNumber("");
            setAcceptedTerms(false);
            setSignedForm(null);
            setLinkedOrganisation(null);
            localStorage.removeItem('linkOrganisationState');
        }
    };

    const handleFileSelect = (file) => {
        if (file && file.type === 'application/pdf') {
            setSignedForm(file);
            clearError();
        } else {
            setError('Please upload a PDF file', 'Invalid File Type');
        }
    };

    const isFormValid = () => {
        return cfNumber.length === 12 && acceptedTerms;
    };

    return (
        <div className={styles.mainLinkContainer}>
            {step === 1 ? (
                <>
                    <div className={styles.inputWrapper}>
                        <Input
                            theme="dark"
                            placeholder="CF Registration No.:"
                            size="medium"
                            value={formatCfNumber(cfNumber)}
                            onChange={(e) => handleCfNumberChange(e.target.value)}
                            className={styles.cfInput}
                            maxLength={15} 
                        />
                        <div className={styles.formatHint}>
                            Format: 99-XXXX-XXXX-XX (12 digits starting with 99)
                        </div>
                    </div>

                    <div className={styles.checkboxContainer}>
                        <input 
                            id="terms" 
                            type="checkbox" 
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                        />
                        <p> 
                            I accept the{" "}
                            <span 
                                className={styles.termsLink}
                                onClick={() => window.open('/termsAndcondititons', '_blank')}
                            >
                                Terms & Conditions
                            </span>
                        </p>
                    </div>
                    
                    <Button 
                        size="medium" 
                        onClick={handleLink}
                        disabled={!isFormValid() || loading}
                        variant="secondary"
                    >
                        {loading ? loadingMessage || 'Linking...' : 'Link Organisation'}
                    </Button>
                </>
            ) : (
                <>
                    <div className={styles.successMessage}>
                        <h3>✓ Linking Request Sent</h3>
                        <p>We've sent an authorization form to <strong>{linkedOrganisation.tradingName}</strong>.</p>
                        <p>Please download the form from your email, have it signed, and upload it below.</p>
                    </div>

                    <div className={styles.uploadSection}>
                        <FileInput
                            theme="dark"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            placeholder="Upload Signed Authorization Form"
                            disabled={loading}
                            size="full"
                        />
                        {signedForm && (
                            <div className={styles.fileInfo}>
                                Selected: {signedForm.name}
                            </div>
                        )}
                    </div>

                    <Button 
                        size="medium" 
                        onClick={handleFormUpload}
                        disabled={!signedForm || loading}
                        variant="secondary"
                    >
                        {loading ? loadingMessage || 'Uploading...' : 'Submit Signed Form'}
                    </Button>
                </>
            )}
        </div>
    )
}

export default LinkOrganisation;