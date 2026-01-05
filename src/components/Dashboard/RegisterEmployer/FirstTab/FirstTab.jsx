import { useState, useEffect } from "react";
import Dropdown from "../../../common/Dopdown/Dropdown";
import styles from "./FirstTab.module.scss";
import Input from "../../../common/Input/Input";
import Button from "../../../common/Button/Button";
import FileInput from "../../../common/fileInput/fileInput";
import { useOrganisation } from "../../../../contexts/OrganisationContext";
import ModalOverlay from "../modalOverlay/ModalOverlay";

const FirstTab = ({ setNavigation }) => {
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedDocument, setSelectedDocument] = useState('');
    const [registationNumber, setRegistrationNumber] = useState('');
    const [identityNumber, setIdentityNumber] = useState('');
    const [taxNumber, setTaxNumber] = useState('');
    const [pendingFiles, setPendingFiles] = useState([]);
    const [verified, setVerified] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState(0);
    const [organizationDetails, setOrganizationDetails] = useState(null);
    const [persistedDocuments, setPersistedDocuments] = useState([]);
    const [showConfirmOverlay, setShowConfirmOverlay] = useState(false);

    const normalizePendingFiles = () => {
        setPendingFiles(prevFiles => 
            prevFiles.map(fileEntry => {
                let file = fileEntry.file;
                
                if (Array.isArray(file) && file.length > 0) {
                    file = file[0];
                }
                
                return {
                    ...fileEntry,
                    file: file,
                    name: file.name,
                    type: file.type,
                    size: file.size
                };
            })
        );
    };

    useEffect(() => {
        if (pendingFiles.length > 0) {
            normalizePendingFiles();
        }
    }, [pendingFiles.length]);

    useEffect(() => {
        const savedState = localStorage.getItem('registerOrganisationState');
        if (savedState) {
            try {
                const {
                    selectedValue: savedSelectedValue,
                    registationNumber: savedRegistrationNumber,
                    identityNumber: savedIdentityNumber,
                    taxNumber: savedTaxNumber,
                    verified: savedVerified,
                    organizationDetails: savedOrganizationDetails,
                    organisationDocuments: savedOrganisationDocuments
                } = JSON.parse(savedState);
                setSelectedValue(savedSelectedValue || '');
                setRegistrationNumber(savedRegistrationNumber || '');
                setIdentityNumber(savedIdentityNumber || '');
                setTaxNumber(savedTaxNumber || '');
                setVerified(true); // Set to true to skip modal and show verified state
                setOrganizationDetails(savedOrganizationDetails || null);
                setPersistedDocuments(savedOrganisationDocuments || []);
                setShowConfirmOverlay(false); // Skip modal overlay
            } catch (error) {
                console.error('Error parsing saved state:', error);
            }
        }
    }, []);

    const { 
        organisation,
        documents, 
        loading, 
        loadingMessage,
        submitForApproval,
        verifyOrganisationDetails, 
        uploadDocument,
    } = useOrganisation();

    useEffect(() => {
        setRegistrationNumber('');
        setIdentityNumber('');
        setTaxNumber('');
        setVerified(false);
        setOrganizationDetails(null);
        setShowConfirmOverlay(false);
    }, [selectedValue]);

    const getInputFields = () => {
        switch(selectedValue) {
            case "Body Corporate":
            case "NPO Number":
            case "School":
            case "Trust Number":
                return (
                    <Input
                        type="text"
                        placeholder="Registration Number:"
                        value={registationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        size="medium"
                        theme="dark"
                        required={true}
                    />
                );
                
            case "Domestic Employer":
            case "Sole Proprietor":
                return (
                    <Input
                        type="text"
                        placeholder="ID Number:"
                        value={identityNumber}
                        onChange={(e) => setIdentityNumber(e.target.value)}
                        size="medium"
                        theme="dark"
                        required={true}
                    />
                );
                
            case "Company Registration Number":
                return (
                    <>
                        <Input
                            type="text"
                            placeholder="Registration Number:"
                            value={registationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            size="medium"
                            theme="dark"
                            required={true}
                        />
                        <Input
                            type="text"
                            placeholder="Director's ID Number:"
                            value={identityNumber}
                            onChange={(e) => setIdentityNumber(e.target.value)}
                            size="medium"
                            theme="dark"
                            required={true}
                        />
                        <Input
                            type="text"
                            placeholder="Tax Number:"
                            value={taxNumber}
                            onChange={(e) => setTaxNumber(e.target.value)}
                            size="medium"
                            theme="dark"
                            required={true}
                        />
                    </>
                );
                
            default:
                return null;
        }
    };

    const isVerifyDisabled = () => {
        switch(selectedValue) {
            case "Body Corporate":
            case "NPO Number":
            case "School":
            case "Trust Number":
                return !registationNumber;
                
            case "Domestic Employer":
            case "Sole Proprietor":
                return !identityNumber;
                
            case "Company Registration Number":
                return !registationNumber || !identityNumber || !taxNumber;
                
            default:
                return true;
        }
    };

    const handleCheck = async () => {
        const verificationData = {
            organisationType: selectedValue,
        };

        switch(selectedValue) {
            case "Body Corporate":
            case "NPO Number":
            case "School":
            case "Trust Number":
                verificationData.registrationNumber = registationNumber;
                break;
                
            case "Domestic Employer":
            case "Sole Proprietor":
                verificationData.identityNumber = identityNumber;
                break;
                
            case "Company Registration Number":
                verificationData.registrationNumber = registationNumber;
                verificationData.identityNumber = identityNumber;
                verificationData.taxNumber = taxNumber;
                break;
        }

        const result = await verifyOrganisationDetails(verificationData);
        if (result.success) {
            // Store organizationDetails and show confirmation overlay
            setOrganizationDetails(result.data?.organisationDetails || null);
            setPersistedDocuments(result.data?.organisationDocuments || []);
            setShowConfirmOverlay(true);
            // Save to localStorage
            localStorage.setItem('registerOrganisationState', JSON.stringify({
                selectedValue,
                registationNumber,
                identityNumber,
                taxNumber,
                verified: false, // Will be set to true after confirmation
                organizationDetails: result.data?.organisationDetails || null,
                organisationDocuments: result.data?.organisationDocuments || []
            }));
            // Do not set verified true here, wait for user confirmation
        }
    }

    const handleFileSelect = (file) => {
        if (file && selectedDocument) {
            
            // If file is an array, extract the first element
            const actualFile = Array.isArray(file) ? file[0] : file;
            
            const newFile = {
                id: Date.now() + Math.random(),
                file: actualFile, // Store the actual File object, not an array
                name: actualFile.name,
                type: actualFile.type,
                size: actualFile.size,
                documentType: selectedDocument,
                documentLabel: getDocumentTypeLabel(selectedDocument),
                uploadDate: new Date().toLocaleDateString()
            };
            
            setPendingFiles(prevFiles => [...prevFiles, newFile]);
        }
    }

    const handleUpload = async () => {
        if (pendingFiles.length === 0) return;

        // Find the first valid file (not an array)
        let validFileEntry = null;
        let validFile = null;

        for (let i = 0; i < pendingFiles.length; i++) {
            const fileEntry = pendingFiles[i];
            let file = fileEntry.file;

            // If file is an array, extract the first element
            if (Array.isArray(file) && file.length > 0) {
                file = file[0];
            }

            // Check if it's a valid File object
            if (file instanceof File) {
                validFileEntry = fileEntry;
                validFile = file;
                break;
            }
        }

        if (!validFile) {
            console.error('No valid file found in pending files');
            return;
        }

        const formData = new FormData();
        formData.append('file', validFile);
        formData.append('documentType', selectedDocument);
        formData.append('organisationType', selectedValue);
        formData.append('registrationNumber', registationNumber);


        const result = await uploadDocument(formData);
        console.log(uploadedFiles, 'should move on to submitting')
        setUploadedFiles(prev => prev + 1);

        if (result.success) {
            // Remove only the uploaded file from pendingFiles
            setPendingFiles(prevFiles => prevFiles.filter(f => f.id !== validFileEntry.id));

            // Update localStorage with the new uploaded documents
            const updatedState = {
                selectedValue,
                registationNumber,
                identityNumber,
                taxNumber,
                verified: true,
                organizationDetails,
                organisationDocuments: [...persistedDocuments, ...documents]
            };
            localStorage.setItem('registerOrganisationState', JSON.stringify(updatedState));
        }
    }

    const handleSubmitForApproval = async () => {
        const result = await submitForApproval(organizationDetails);
        if (result.success) {
            localStorage.removeItem('registerOrganisationState');
        }
    }

    const getDocumentTypeLabel = (documentValue) => {
        // Get the current document options based on selected organisation type
        const currentDocumentOptions = getDocumentsList();
        const found = currentDocumentOptions.find(opt => opt.value === documentValue);
        return found ? found.label : 'Unknown Document';
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const displayDocuments = documents.length > 0 ? documents : persistedDocuments;

    const filesByDocumentType = displayDocuments.reduce((acc, file) => {
        if (!file || !file.documentType) return acc;

        if (!acc[file.documentType]) {
            acc[file.documentType] = [];
        }
        acc[file.documentType].push(file);
        return acc;
    }, {});
    
    const getDocumentsList = () => {
        if (selectedValue === "Body Corporate" || selectedValue === "Trust Number") {
            return [
                { value: 'Id_Copy', label: 'ID copy of any of the Trustees' },
                { value: 'Letter_of_Authority', label: 'Letter of Authority by the Court' },
                { value: 'Business_Address', label: 'Proof of Business Address' }
            ]
        } if (selectedValue === "Domestic Employer") {
            return [
                { value: 'Id_Copy', label: 'ID copy of any of the Owner/s' },
                { value: 'Business_Address', label: 'Proof of Business Address' }
            ]
        } if (selectedValue === "NPO Number" || selectedValue === "School") {
            return [
                { value: 'Proof_of_Registration', label: 'Proof of Registration with the Social Service Department' },
                { value: 'Id_Copy', label: 'ID copy of any of the Directors' },
                { value: 'Business_Address', label: 'Proof of Business Address' }
            ]
        } if (selectedValue === "Sole Proprietor") {
            return [
                { value: 'Id_Copy', label: 'ID copy of any of the Directors' },
                { value: 'Business_Address', label: 'Proof of Business Address' }
            ]
        } else{
            return [
                { value: 'Id_Copy', label: 'ID copy of any of the Directors' },
                { value: 'CIPC_Certificate', label: 'Copy of CIPC Certificate' },
                { value: 'Business_Address', label: 'Proof of Business Address' }
            ]
            
        }
    }

    useEffect(() => {
        if (!selectedValue || !organisation) return;

        const getRequiredDocumentTypes = () => {
            switch(selectedValue) {
                case "Body Corporate":
                case "Trust Number":
                    return ['Id_Copy', 'Letter_of_Authority', 'Business_Address'];
                    
                case "Domestic Employer":
                    return ['Id_Copy', 'Business_Address'];
                    
                case "NPO Number":
                case "School":
                    return ['Proof_of_Registration', 'Id_Copy', 'Business_Address'];
                    
                case "Sole Proprietor":
                    return ['Id_Copy', 'Business_Address'];
                    
                default: 
                    return ['Id_Copy', 'CIPC_Certificate', 'Business_Address'];
            }
        };

        const requiredDocumentTypes = getRequiredDocumentTypes();
        const uploadedDocumentTypes = documents.map(doc => doc.documentType);
        
        const allRequiredUploaded = requiredDocumentTypes.every(type => 
            uploadedDocumentTypes.includes(type)
        );
        
        if (allRequiredUploaded && documents.length >= requiredDocumentTypes.length && organisation) {
            const timer = setTimeout(() => {
                setNavigation('SelectOrganisation');
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [documents, organisation, selectedValue, setNavigation]); 

    return (
        <>
            <div className={styles.firstContainer}>
                <div className={styles.verifyContainer}>
                    <Dropdown
                        options={[
                            { value: 'Body Corporate', label: 'Body Corporate' },
                            { value: 'School', label: 'School' },
                            { value: 'Company Registration Number', label: 'Company Registration Number' },
                            { value: 'Domestic Employer', label: 'Domestic Employer' },
                            { value: 'NPO Number', label: 'NPO Number' },
                            { value: 'Sole Proprietor', label: 'Sole Proprietor' },
                            { value: 'Trust Number', label: 'Trust Number' }
                        ]}
                        value={selectedValue}
                        onChange={(option) => setSelectedValue(option.value)}
                        placeholder="Choose Organisation Type"
                        label="Select Organisation"
                        theme="dark"
                    />
                    
                    {getInputFields()}
                    
                    <Button
                        variant="secondary" 
                        size="medium"
                        onClick={handleCheck}
                        disabled={!selectedValue || isVerifyDisabled()}
                    >
                        Verify Details
                    </Button>
                </div>
                
                {verified && 
                    <div className={styles.uploadContainer}>
                        <Dropdown
                            options={getDocumentsList()}
                            value={selectedDocument}
                            onChange={(option) => setSelectedDocument(option.value)}
                            placeholder="Choose Document Type"
                            label="Select Document Type"
                            theme="dark"
                        />
                        <FileInput
                            theme="dark"
                            multiple={true}
                            onChange={(files) => {handleFileSelect(files)}}
                            disabled={!selectedDocument}
                            placeholder={`Upload ${selectedDocument ? getDocumentTypeLabel(selectedDocument) : 'document'}`}
                        />
                        
                        <Button
                            size="small"
                            onClick={handleUpload}
                            disabled={pendingFiles.length === 0 || loading}
                            className={loading ? styles.uploadingButton : ''}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    {loadingMessage || 'Uploading...'}
                                </>
                            ) : (
                                `Upload (${pendingFiles.length})`
                            )}
                        </Button>
                    </div>
                }
            </div>

            {verified && displayDocuments.length > 0 &&
                <div className={styles.secondContainer}>
                    <h2>Uploaded Documents</h2>

                    {Object.entries(filesByDocumentType).map(([documentType, documentFiles]) => (
                        <div key={documentType} className={styles.documentGroup}>
                            <h3 className={styles.documentGroupTitle}>
                                {getDocumentTypeLabel(documentType)}
                            </h3>
                            <ul className={styles.fileList}>
                                {documentFiles.map((file) => (
                                    <li key={file.id} className={styles.fileItem}>
                                        <span className={styles.fileIcon}>✓</span>
                                        <div className={styles.fileInfo}>
                                            <span className={styles.fileName}>
                                                ROE_{file.name || 'document'}
                                            </span>
                                            <span className={styles.fileDetails}>
                                                {formatFileSize(file.size || 0)} • {file.uploadDate || 'Unknown date'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div className={styles.uploadSummary}>
                        Total: {displayDocuments.length} document{displayDocuments.length !== 1 ? 's' : ''} uploaded across {Object.keys(filesByDocumentType).length} document type{Object.keys(filesByDocumentType).length !== 1 ? 's' : ''}
                    </div>
                </div>
            }

            {uploadedFiles === getDocumentsList().length && (
                <div className={styles.SubmissionPopUp}>
                    <div className={styles.SubmissionPopUpInner}>
                        <h3 className="alert-heading">
                            Organization Registration Submission
                        </h3>
                        <p className="mb-0">
                            You are about to submit <strong>{organizationDetails.tradingName}</strong> for official registration.
                        </p>

                        <div className={styles.buttonsContainer}>
                            <Button onClick={() => submitForApproval(organizationDetails)} variant="secondary" size="full">Submit</Button>
                        </div>
                    </div>

                </div>
            )}

            <ModalOverlay 
                setVerified={setVerified}
                setShowConfirmOverlay={setShowConfirmOverlay}
                organizationDetails={organizationDetails} 
                showConfirmOverlay={showConfirmOverlay}/>
            
        </>
    )
}

export default FirstTab;