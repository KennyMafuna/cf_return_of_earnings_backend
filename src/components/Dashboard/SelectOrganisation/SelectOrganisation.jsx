import { useState, useEffect } from 'react';
import { useOrganisation } from '../../../contexts/OrganisationContext';
import { useError } from '../../../contexts/ErrorContext';
import styles from './SelectOrganisation.module.scss';
import Button from '../../common/Button/Button';
import OrganisationView from './OrganisationView/OrganisationView';
import { industryOptionsArray } from '../../../constants/industryOptions';

const SelectOrganisation = ({ setNavigation }) => {
    const [organisations, setOrganisations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrganisation, setSelectedOrganisation] = useState(null);
    const [copiedText, setCopiedText] = useState('');
    const [isViewing, setIsViewing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { getUserOrganisations } = useOrganisation();

    useEffect(() => {
        loadOrganisations();
    }, []);

    const loadOrganisations = async () => {
        setLoading(true);
        const result = await getUserOrganisations();
        
        if (result.success) {
            setOrganisations(result.data.organisations);
        } 
        setLoading(false);
    };

    const handleOrganisationSelect = async (organisation) => {
        setSelectedOrganisation(organisation);
    };

    const clearSelectedOrganisation = () => {
        setSelectedOrganisation(null);
    };

    const copyToClipboard = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(label);
            
            setTimeout(() => {
                setCopiedText('');
            }, 2000);
        } catch (error) {
            console.error('Failed to copy text:', error);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            setCopiedText(label);
            setTimeout(() => setCopiedText(''), 2000);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { label: 'Draft', className: styles.draft },
            submitted: { label: 'Pending', className: styles.submitted },
            approved: { label: 'Approved', className: styles.approved },
            rejected: { label: 'Rejected', className: styles.rejected }
        };
        
        const config = statusConfig[status] || { label: status, className: styles.draft };
        return (
            <span className={`${styles.statusBadge} ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className={styles.selectOrganisation}>
            {isViewing ? (
                <OrganisationView 
                    organisation={selectedOrganisation} 
                    setIsViewing={setIsViewing}
                    isEdit={false}
                    industryOptions={industryOptionsArray}
                />
            ) : isEditing ? (
                <OrganisationView 
                    organisation={selectedOrganisation} 
                    setIsViewing={setIsEditing}
                    isEdit={true}
                    industryOptions={industryOptionsArray}
                />
            ) : (
                <>
                    {organisations.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🏢</div>
                            <h3>No Organisations Found</h3>
                            <p>You haven't registered any organisations yet.</p>
                            <Button 
                                size='small'
                                onClick={() => setNavigation("register")}>
                                Register Employer
                            </Button>
                        </div>
                    ) : (
                        <>
                            {selectedOrganisation && (
                                <div 
                                    className={styles.overlay}
                                    onClick={clearSelectedOrganisation}
                                />
                            )}
                            
                            <div className={`${styles.organisationsList} ${selectedOrganisation ? styles.blurred : ''}`}>
                                {organisations.map((org) => (
                                    <div 
                                        key={org.id}
                                        className={`${styles.organisationCard} ${
                                            selectedOrganisation?.id === org.id ? styles.selected : ''
                                        }`}
                                        onClick={() => handleOrganisationSelect(org)}
                                    >
                                        <div className={styles.cardHeader}>
                                            <div className={styles.orgMainInfo}>
                                                <h3 className={styles.orgName}>
                                                    {org.organisationDetails?.tradingName || 'Unnamed Organisation'}
                                                    <div className={styles.badgesContainer}>
                                                        {getStatusBadge(org.status)}
                                                    </div>
                                                </h3>
                                                <p className={styles.orgRegistration}>
                                                    {org.registrationNumber}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={styles.cardDetails}>
                                            {org.taxNumber &&
                                                <div className={styles.detailRow}>
                                                    <span className={styles.label}>Tax Number:</span>
                                                    <span className={styles.value}>{org.taxNumber}</span>
                                                </div>
                                            }
                                            
                                            {org.status === 'approved' && org.cfRegistrationNumber && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.label}>CF Registration Number:</span>
                                                    <div className={styles.copyableField}>
                                                        <span className={styles.cfNumber}>
                                                            {org.cfRegistrationNumber}
                                                        </span>
                                                        <button 
                                                            className={styles.copyButton}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(org.cfRegistrationNumber, 'CF Registration Number');
                                                            }}
                                                            title="Copy CF Registration Number"
                                                        >
                                                            {copiedText === 'CF Registration Number' ? '✅' : '📋'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {org.status === 'approved' && org.bpNumber && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.label}>BP Number:</span>
                                                    <div className={styles.copyableField}>
                                                        <span className={styles.cfNumber}>
                                                            {org.bpNumber}
                                                        </span>
                                                        <button 
                                                            className={styles.copyButton}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(org.bpNumber, 'BP Number');
                                                            }}
                                                            title="Copy BP Number"
                                                        >
                                                            {copiedText === 'BP Number' ? '✅' : '📋'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className={styles.detailRow}>
                                                <span className={styles.label}>Contact:</span>
                                                <span className={styles.value}>
                                                    {org.organisationDetails?.contact?.person || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
        
                    {organisations.length > 0 && selectedOrganisation && (
                        <div className={styles.selectedInfo}>
                            <button 
                                className={styles.closeButton}
                                onClick={clearSelectedOrganisation}
                                aria-label="Close"
                            >
                                ×
                            </button>
                            
                            <h4>Selected: {selectedOrganisation.organisationDetails?.tradingName}</h4>
                            
                            {selectedOrganisation.status === 'approved' && selectedOrganisation.cfRegistrationNumber && (
                                <div className={styles.cfNumberSection}>
                                    <p><strong>CF Registration Number:</strong></p>
                                    <div className={styles.copyableField}>
                                        <span className={styles.cfNumberLarge}>
                                            {selectedOrganisation.cfRegistrationNumber}
                                        </span>
                                        <button 
                                            className={styles.copyButton}
                                            onClick={() => copyToClipboard(selectedOrganisation.cfRegistrationNumber, 'CF Registration Number')}
                                            title="Copy CF Registration Number"
                                        >
                                            {copiedText === 'CF Registration Number' ? '✅ Copied!' : '📋 Copy'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedOrganisation.status === 'approved' && selectedOrganisation.bpNumber && (
                                <div className={styles.cfNumberSection}>
                                    <p><strong>BP Number:</strong></p>
                                    <div className={styles.copyableField}>
                                        <span className={styles.cfNumberLarge}>
                                            {selectedOrganisation.bpNumber}
                                        </span>
                                        <button 
                                            className={styles.copyButton}
                                            onClick={() => copyToClipboard(selectedOrganisation.bpNumber, 'BP Number')}
                                            title="Copy BP Number"
                                        >
                                            {copiedText === 'BP Number' ? '✅ Copied!' : '📋 Copy'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <p>You can now proceed to manage this organisation.</p>
                            
                            <div className={styles.buttonContainer}>
                                <Button
                                    disabled={!selectedOrganisation || selectedOrganisation.status !== "approved"}
                                >
                                    Submit ROE
                                </Button>
                                <Button onClick={() => setIsViewing(true)}>
                                    View All Details
                                </Button>
                                <Button onClick={() => setIsEditing(true)}>
                                    Edit Organisation
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {copiedText && (
                <div className={styles.copyNotification}>
                    {copiedText} copied to clipboard!
                </div>
            )}
        </div>
    );
};

export default SelectOrganisation;