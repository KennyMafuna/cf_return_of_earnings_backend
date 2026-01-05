import styles from "./OrganisationView.module.scss";
import Input from "../../../common/Input/Input";
import Button from "../../../common/Button/Button";
import { useOrganisation } from "../../../../contexts/OrganisationContext";
import { useEffect, useState } from "react";
import FileInput from "../../../common/fileInput/fileInput";

const OrganisationView = ({ organisation, isEdit = false, setIsViewing, industryOptions = [] }) => {
    const { 
        downloadDocument, 
        updateContactInfo, 
        updateAddressInfo, 
        updateBankingInfo, 
        updateBusinessInfo,
        resubmitForApproval,
        updateDocument 
    } = useOrganisation();

    // State for selected files
    const [selectedFiles, setSelectedFiles] = useState({});

    // Handle file selection from your FileInput component
    const handleFileSelect = (documentId, file) => {
        if (file) {
            setSelectedFiles(prev => ({
                ...prev,
                [documentId]: file
            }));
        } else {
            // If file is null (cleared), remove from state
            setSelectedFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[documentId];
                return newFiles;
            });
        }
    };

    // Handle document update
    const handleUpdateDocument = async (documentId, documentType) => {
        const file = selectedFiles[documentId];
        if (!file) {
            alert('Please select a file first');
            return;
        }

        const result = await updateDocument(organisation.id, documentId, documentType, file);
        if (result.success) {
            // Clear the selected file after successful update
            setSelectedFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[documentId];
                return newFiles;
            });
        }
    };

    // State for form values and changes
    const [formValues, setFormValues] = useState({
        contact: {},
        address: {},
        banking: {},
        business: {}
    });
    
    const [hasChanges, setHasChanges] = useState({
        contact: false,
        address: false,
        banking: false,
        business: false
    });

    // Initialize form values when organisation changes
    useEffect(() => {
        if (organisation) {
            setFormValues({
                contact: { ...organisation.organisationDetails?.contact },
                address: { ...organisation.organisationDetails?.address?.street },
                banking: { ...organisation.organisationDetails?.banking },
                business: {
                    ...organisation.organisationDetails?.businessInfo,
                    firstEmployeeDate: organisation.organisationDetails?.firstEmployeeDate
                }
            });
        }
    }, [organisation]);

    // Check for changes
    useEffect(() => {
        if (!organisation) return;

        const currentContact = organisation.organisationDetails?.contact || {};
        const currentAddress = organisation.organisationDetails?.address?.street || {};
        const currentBanking = organisation.organisationDetails?.banking || {};
        const currentBusiness = {
            ...organisation.organisationDetails?.businessInfo,
            firstEmployeeDate: organisation.organisationDetails?.firstEmployeeDate
        };

        setHasChanges({
            contact: hasObjectChanged(currentContact, formValues.contact),
            address: hasObjectChanged(currentAddress, formValues.address),
            banking: hasObjectChanged(currentBanking, formValues.banking),
            business: hasObjectChanged(currentBusiness, formValues.business)
        });
    }, [formValues, organisation]);

    // Helper function to check if objects have changed
    const hasObjectChanged = (original, current) => {
        const keys = [...new Set([...Object.keys(original || {}), ...Object.keys(current || {})])];
        return keys.some(key => {
            const originalVal = original?.[key];
            const currentVal = current?.[key];
            
            // Handle date comparison
            if (key === 'firstEmployeeDate' && originalVal && currentVal) {
                return new Date(originalVal).getTime() !== new Date(currentVal).getTime();
            }
            
            return originalVal !== currentVal;
        });
    };

    // Handle input changes
    const handleInputChange = (section, field, value) => {
        setFormValues(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Save handlers for each section
    const handleSaveContact = async () => {
        const result = await updateContactInfo(organisation.id, formValues.contact);
        if (result.success) {
            // Reset changes for this section
            setHasChanges(prev => ({ ...prev, contact: false }));
        }
    };

    const handleSaveAddress = async () => {
        const result = await updateAddressInfo(organisation.id, formValues.address);
        if (result.success) {
            setHasChanges(prev => ({ ...prev, address: false }));
        }
    };

    const handleSaveBanking = async () => {
        const result = await updateBankingInfo(organisation.id, formValues.banking);
        if (result.success) {
            setHasChanges(prev => ({ ...prev, banking: false }));
        }
    };

    const handleSaveBusiness = async () => {
        const result = await updateBusinessInfo(organisation.id, {
            businessInfo: {
                numberOfEmployees: formValues.business.numberOfEmployees,
                industries: formValues.business.industries
            },
            firstEmployeeDate: formValues.business.firstEmployeeDate
        });
        if (result.success) {
            setHasChanges(prev => ({ ...prev, business: false }));
        }
    };

    const getIndustryLabels = (industryValues = []) => {
        return industryValues.map(value => {
            const industry = industryOptions.find(opt => opt.value === value);
            return industry ? industry.label : value;
        });
    };

    const getDocumentTypeLabel = (documentType) => {
        const labels = {
            'Id_Copy': 'ID Copy',
            'CIPC_Certificate': 'CIPC Certificate',
            'Business_Address': 'Business Address Proof',
            'Bank_Statement': 'Bank Statement',
            'Linking_Form': 'Linking Form',
            'Letter_of_Authority': 'Letter of Authority',
            'Proof_of_Registration': 'Proof of Registration'
        };
        return labels[documentType] || documentType;
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleResubmit = async () => {
        const result = await resubmitForApproval(organisation.id);
        if (result.success) {
            // Optionally navigate away or refresh the view
            setIsViewing(false);
        }
    };

    return (
        <div className={styles.viewMainContainer}>
            <div className={styles.headerContainer}>
                {/* Basic Information Section */}
                <div className={styles.section}>
                    <h3 className={styles.headerTitle}>Basic Information</h3>
                    <div className={styles.headerSubSection}>
                        {organisation.organisationDetails?.tradingName &&
                            <div className={styles.headerRow}>
                                <span className={styles.rowTitle}>Trading Name:</span>
                                <span className={styles.rowValue}>{organisation.organisationDetails?.tradingName}</span>
                            </div>
                        }
                        {organisation.registrationNumber &&
                            <div className={styles.headerRow}>
                                <span className={styles.rowTitle}>Registration Name:</span>
                                <span className={styles.rowValue}>{organisation.registrationNumber}</span>
                            </div>
                        }
                        {organisation.taxNumber &&
                            <div className={styles.headerRow}>
                                <span className={styles.rowTitle}>Tax Number:</span>
                                <span className={styles.rowValue}>{organisation.taxNumber}</span>
                            </div>
                        }
                        {organisation.cfRegistrationNumber &&
                            <div className={styles.headerRow}>
                                <span className={styles.rowTitle}>CF Registration Number:</span>
                                <span className={styles.rowValue}>{organisation.cfRegistrationNumber}</span>
                            </div>
                        }
                        {organisation.organisationType &&
                            <div className={styles.headerRow}>
                                <span className={styles.rowTitle}>Organisation Type:</span>
                                <span className={styles.rowValue}>{organisation.organisationType}</span>
                            </div>
                        }
                        {organisation.organisationDetails?.ownershipType &&
                            <div className={styles.headerRow}>
                                <span className={styles.rowTitle}>Ownership Type:</span>
                                <span className={styles.rowValue}>{organisation.organisationDetails?.ownershipType}</span>
                            </div>
                        }
                    </div>
                </div>

                {/* Status Information */}
                <div className={styles.section}>
                    <h3 className={styles.headerTitle}>Status Information</h3>
                    <div className={styles.headerSubSection}>
                        <div className={styles.headerRow}>
                            <span className={styles.rowTitle}>Approval Status:</span>
                            <span className={`${styles.rowValue} ${styles[organisation.status]}`}>
                                {organisation.status}
                            </span>
                        </div>
                        <div className={styles.headerRow}>
                            <span className={styles.rowTitle}>Submitted Date:</span>
                            <span className={styles.rowValue}>
                                {organisation.submittedAt ? new Date(organisation.submittedAt).toLocaleDateString('en-ZA') : 'N/A'}
                            </span>
                        </div>
                        { (organisation.approvedAt || organisation.rejectedAt )&&
                            <>
                                { organisation.approvedAt  ?
                                    <div className={styles.headerRow}>
                                        <span className={styles.rowTitle}>Approved Date:</span>
                                        <span className={styles.rowValue}>
                                            {new Date(organisation.approvedAt).toLocaleDateString('en-ZA')}
                                        </span>
                                    </div>
                                :
                                    <>
                                        <div className={styles.headerRow}>
                                            <span className={styles.rowTitle}>Rejected Date:</span>
                                            <span className={styles.rowValue}>
                                                {new Date(organisation.rejectedAt.rejectedAt).toLocaleDateString('en-ZA')}
                                            </span>
                                        </div>
                                        <div className={styles.headerRow}>
                                            <span className={styles.rowTitle}>Reason:</span>
                                            <span className={styles.notes}>
                                                {organisation.rejectedAt.reason}
                                            </span>
                                        </div>
                                        <div className={styles.headerRow}>
                                            <span className={styles.rowTitle}>Additional Notes:</span>
                                            <span className={styles.notes}>
                                                {organisation.rejectedAt.notes}
                                            </span>
                                        </div>
                                    </>
                                }
                            </>
                        }
                    </div>
                </div>
            </div>
            <div className={styles.content}>


                 {/* Contact Information Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Contact Information</h3>
                    <div className={styles.formGrid}>
                        <Input
                            placeholder="Contact Person"
                            value={formValues.contact.person || ''}
                            onChange={(e) => handleInputChange('contact', 'person', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Email"
                            value={formValues.contact.email || ''}
                            onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Telephone"
                            value={formValues.contact.telephone || ''}
                            onChange={(e) => handleInputChange('contact', 'telephone', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Cellphone"
                            value={formValues.contact.cellphone || ''}
                            onChange={(e) => handleInputChange('contact', 'cellphone', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        {isEdit && (
                            <div className={styles.saveButtonContainer}>
                                <Button 
                                    size="small"
                                    variant="secondary" 
                                    onClick={handleSaveContact}
                                    disabled={!hasChanges.contact}
                                    className={styles.saveButton}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Address Information Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Address Information</h3>
                    <div className={styles.formGrid}>
                        <Input
                            placeholder="Street Number"
                            value={formValues.address.number || ''}
                            onChange={(e) => handleInputChange('address', 'number', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Street Name"
                            value={formValues.address.name || ''}
                            onChange={(e) => handleInputChange('address', 'name', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Suburb"
                            value={formValues.address.suburb || ''}
                            onChange={(e) => handleInputChange('address', 'suburb', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="City"
                            value={formValues.address.city || ''}
                            onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Province"
                            value={formValues.address.province || ''}
                            onChange={(e) => handleInputChange('address', 'province', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Postal Code"
                            value={formValues.address.postalCode || ''}
                            onChange={(e) => handleInputChange('address', 'postalCode', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        {isEdit && (
                            <div className={styles.saveButtonContainer}>
                                <Button 
                                    size="small"
                                    variant="secondary" 
                                    onClick={handleSaveAddress}
                                    disabled={!hasChanges.address}
                                    className={styles.saveButton}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Banking Information Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Banking Information</h3>
                    <div className={styles.formGrid}>
                        <Input
                            placeholder="Bank Name"
                            value={formValues.banking.bankName || ''}
                            onChange={(e) => handleInputChange('banking', 'bankName', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Account Holder"
                            value={formValues.banking.accountHolder || ''}
                            onChange={(e) => handleInputChange('banking', 'accountHolder', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Account Number"
                            value={formValues.banking.accountNumber || ''}
                            onChange={(e) => handleInputChange('banking', 'accountNumber', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="Branch Code"
                            value={formValues.banking.branchCode || ''}
                            onChange={(e) => handleInputChange('banking', 'branchCode', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        {isEdit && (
                            <div className={styles.saveButtonContainer}>
                                <Button 
                                    size="small"
                                    variant="secondary" 
                                    onClick={handleSaveBanking}
                                    disabled={!hasChanges.banking}
                                    className={styles.saveButton}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Business Information Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Business Information</h3>
                    <div className={styles.formGrid}>
                        <Input
                            placeholder="Number of Employees"
                            value={formValues.business.numberOfEmployees || ''}
                            onChange={(e) => handleInputChange('business', 'numberOfEmployees', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <Input
                            placeholder="First Employee Date"
                            type="date"
                            value={formValues.business.firstEmployeeDate ? 
                                new Date(formValues.business.firstEmployeeDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleInputChange('business', 'firstEmployeeDate', e.target.value)}
                            disabled={!isEdit}
                            theme="dark"
                            size="medium"
                        />
                        <div className={styles.industriesSection}>
                            <h4 className={styles.industriesLabel}>Nature of Business</h4>
                            <div className={styles.industriesList}>
                                {getIndustryLabels(organisation.organisationDetails?.businessInfo?.industries).map((industry, index) => (
                                    <span key={index} className={styles.industryTag}>
                                        {industry}
                                    </span>
                                )) || 'No Nature of business specified'}
                            </div>
                        </div>
                        <div></div>
                        {isEdit && (
                            <div className={styles.saveButtonContainer}>
                                <Button 
                                    size="small"
                                    variant="secondary" 
                                    onClick={handleSaveBusiness}
                                    disabled={!hasChanges.business}
                                    className={styles.saveButton}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Documents Section */}
                {organisation.documents && organisation.documents.length > 0 && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Documents</h3>
                        <div className={styles.documentsGrid}>
                            {organisation.documents.map((doc, index) => (
                                <div key={doc._id || index} className={styles.documentCard}>
                                    <div className={styles.documentIcon}>
                                        <span>📄</span>
                                    </div>
                                    <div className={styles.documentInfo}>
                                        <h4 className={styles.documentName}>
                                            {getDocumentTypeLabel(doc.documentType)}
                                        </h4>
                                        <p className={styles.documentDetails}>
                                            {doc.originalName}
                                        </p>
                                        <p className={styles.documentMeta}>
                                            {formatFileSize(doc.fileSize)} • 
                                            Uploaded: {new Date(doc.uploadDate).toLocaleDateString('en-ZA')}
                                        </p>
                                    </div>
                                    
                                    {isEdit && (
                                        <div className={styles.fileUpdateSection}>
                                            <FileInput
                                                placeholder={`Replace ${getDocumentTypeLabel(doc.documentType)}`}
                                                onChange={(file) => handleFileSelect(doc._id, file)}
                                                size="full"
                                                theme="dark"
                                                accept=".pdf,.tif,.jpg,.jpeg,.png"
                                                multiple={false}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className={styles.documentActions}>
                                        {selectedFiles[doc._id] && (
                                            <Button 
                                                size="small"
                                                onClick={() => handleUpdateDocument(doc._id, doc.documentType)}
                                                className={styles.updateButton}
                                                variant="secondary"
                                            >
                                                Update Document
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!organisation.documents || organisation.documents.length === 0) && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Documents</h3>
                        <div className={styles.emptyState}>
                            <p>No documents uploaded for this organisation.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <Button 
                    size="small"
                    className={styles.backButton}
                    onClick={() => setIsViewing(false)}
                >
                    Back to List
                </Button>
                {(organisation.status === "rejected" && isEdit) &&
                    <Button 
                        size="small"
                        className={styles.resubmitButton}
                        onClick={handleResubmit}
                        variant="secondary"
                    >
                        Re-Submit for Approval
                    </Button>
                }
            </div>
        </div>
    );
};

export default OrganisationView;