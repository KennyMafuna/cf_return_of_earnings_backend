import React, { createContext, useState, useContext } from 'react';
import { useError } from './ErrorContext';
import organisationService from '../services/organisationService';
import { useLoading } from './LoadingContext';

const OrganisationContext = createContext();

export const OrganisationProvider = ({ children }) => {
    const [organisation, setOrganisation] = useState(null);
    const [organisationRegDetails, setOrganisationRegDetails] = useState(null)
    const [documents, setDocuments] = useState([]);
    const [verificationDetails, setVerificationDetails] = useState(null);
    
    const { setError, clearAllErrors } = useError();
    const { startLoading, stopLoading } = useLoading();

    const verifyOrganisationDetails = async (organisationData) => {
        startLoading('Verifying organisation details...');
        clearAllErrors();
        
        try {
            const response = await organisationService.verifyDetails(organisationData);
            
            if (response.success) {
                setOrganisation(response.data.organisation);
                setVerificationDetails(response.data);
                setError(
                    'Organisation details verified successfully!',
                    'Verification Complete',
                    'success'
                );
                setOrganisationRegDetails(organisationData);
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Verification Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Verification error:', error); // Debug
            const message = error.response?.data?.message || 'Verification failed. Please try again.';
            setError(message, 'Verification Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };
    
    const uploadDocument = async (formData) => {
        startLoading('Uploading document...');
        clearAllErrors();
        
        try {
            const response = await organisationService.uploadDocument(formData);
            
            if (response.success) {
                
                const newDocument = response.data.document;
                
                const formattedDocument = {
                    id: newDocument.id || newDocument._id,
                    name: newDocument.originalName || newDocument.name,
                    documentType: newDocument.documentType,
                    size: newDocument.fileSize || newDocument.size,
                    uploadDate: newDocument.uploadDate || new Date().toLocaleDateString()
                };
                
                setDocuments(prev => [...prev, formattedDocument]);
                setError(
                    'Document uploaded successfully!',
                    'Upload Complete',
                    'success'
                );
                return { success: true, data: formattedDocument };
            } else {
                setError(response.message, 'Upload Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Upload document error:', error);
            const message = error.response?.data?.message || 'Document upload failed. Please try again.';
            setError(message, 'Upload Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const updateDocument = async (organisationId, documentId, documentType, file) => {
        startLoading('Updating document...');
        clearAllErrors();
        
        try {
            const formData = new FormData();
            formData.append('file', file);


            const response = await organisationService.updateDocument(organisationId, documentId, documentType, formData);
            
            if (response.success) {
                // Update the documents in context
                setOrganisation(prev => {
                    if (!prev) return prev;
                    
                    const updatedDocuments = prev.documents.map(doc => 
                        doc._id === documentId ? response.data.document : doc
                    );
                    
                    return {
                        ...prev,
                        documents: updatedDocuments
                    };
                });
                
                setError(
                    'Document updated successfully!',
                    'Update Complete',
                    'success'
                );
                getUserOrganisations();
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Update Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update document.';
            setError(message, 'Update Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const updateOrganisationDetails = async (organisationId, organisationData) => {
        startLoading("Updating organisation details...");
        clearAllErrors();
        
        try {
            const response = await organisationService.updateOrganisationDetails(organisationId, organisationData);
            
            if (response.success) {
                setOrganisation(prev => ({ ...prev, ...response.data.organisation }));
                setError(
                    'Organisation details updated successfully!',
                    'Update Complete',
                    'success'
                );
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Update Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update organisation details. Please try again.';
            setError(message, 'Update Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const getUserOrganisations = async () => {
        startLoading("Loading organisations...");
        
        try {
            const response = await organisationService.getUserOrganisations();
            
            if (response.success) {
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Load Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load organisations.';
            setError(message, 'Organisations Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };
    
    const submitForApproval = async (registrationNumber) => {
        startLoading("Submitting organisation...");
        clearAllErrors();
        
        try {
            const response = await organisationService.submitForApproval(organisationRegDetails);
            
            if (response.success) {
                setOrganisation(prev => ({ ...prev, status: 'pending_approval' }));
                setError(
                    'Organisation submitted for approval successfully!',
                    'Submission Complete',
                    'success'
                );
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Submission Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Submission failed. Please try again.';
            setError(message, 'Submission Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const loadDocuments = async () => {
        startLoading("Loading documents...");
        
        try {
            const response = await organisationService.getDocuments();
            
            if (response.success) {
                setDocuments(response.data);
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Documents Load Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load documents.';
            setError(message, 'Documents Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const clearOrganisationData = () => {
        setOrganisation(null);
        setDocuments([]);
        setVerificationDetails(null);
    };

    const linkOrganisation = async (cfRegistrationNumber) => {
        startLoading("Linking organisation...");
        clearAllErrors();
        
        try {
            const response = await organisationService.linkOrganisation(cfRegistrationNumber);
            
            if (response.success) {
                setError(
                    'Linking request sent successfully! Check your email for the authorization form.',
                    'Linking Request Sent',
                    'success'
                );
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Linking Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to link organisation. Please try again.';
            setError(message, 'Linking Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const uploadSignedForm = async (organisationId, file) => {
        startLoading("Uploading form...")
        clearAllErrors();
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('organisationId', organisationId);

            const response = await organisationService.uploadSignedForm(formData);
            
            if (response.success) {
                setError(
                    'Signed form uploaded successfully! Your linking request is being processed.',
                    'Form Uploaded',
                    'success'
                );
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Upload Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to upload form. Please try again.';
            setError(message, 'Upload Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    // View document - PDF specific handling
    const viewDocument = async (filename, originalName, mimeType) => {
        startLoading('Opening document...');
        clearAllErrors();
        
        try {
            if (mimeType === 'application/pdf') {
                // For PDFs, use a more reliable approach
                const fileUrl = `/api/documents/view/${filename}`;
                
                // Create an iframe or embed for PDF viewing
                const pdfViewer = window.open('', '_blank');
                pdfViewer.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${originalName}</title>
                        <style>
                            body { margin: 0; padding: 20px; background: #f5f5f5; }
                            embed { width: 100%; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <embed src="${fileUrl}" type="application/pdf" width="100%" height="100%">
                        <script>
                            // Fallback if embed doesn't work
                            setTimeout(() => {
                                const embed = document.querySelector('embed');
                                if (!embed || embed.offsetHeight === 0) {
                                    document.body.innerHTML = '<div style="text-align: center; padding: 50px;"><p>PDF viewer not supported. <a href="${fileUrl}" download="${originalName}">Download instead</a></p></div>';
                                }
                            }, 1000);
                        </script>
                    </body>
                    </html>
                `);
                pdfViewer.document.close();
                
            } else {
                // For non-PDF files, use the direct URL approach
                const fileUrl = `/uploads/documents/${filename}`;
                const newWindow = window.open(fileUrl, '_blank');
                
                if (!newWindow) {
                    setError('Please allow popups to view documents', 'Popup Blocked');
                    return { success: false, message: 'Popup blocked' };
                }
            }
            
            return { success: true };
        } catch (error) {
            console.error('View document error:', error);
            const message = 'Error opening document. Please try downloading instead.';
            setError(message, 'View Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const downloadDocument = async (filename, originalName, mimeType) => {
        startLoading('Downloading document...');
        clearAllErrors();
        
        try {
            const response = await organisationService.downloadDocument(filename);
            
            // Create download link
            const blob = new Blob([response.data], { type: mimeType });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up URL after download
            setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);
            
            setError(
                'Document downloaded successfully!',
                'Download Complete',
                'success'
            );
            return { success: true };
        } catch (error) {
            console.error('Download document error:', error);
            const message = error.response?.data?.message || 'Error downloading document. Please try again.';
            setError(message, 'Download Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    // Get organisation with documents
    const getOrganisationWithDocuments = async (organisationId) => {
        startLoading('Loading organisation details...');
        clearAllErrors();
        
        try {
            const response = await organisationService.getOrganisationById(organisationId);
            
            if (response.success) {
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Load Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load organisation details.';
            setError(message, 'Load Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    // Update contact information
    const updateContactInfo = async (organisationId, contactData) => {
        startLoading('Updating contact information...');
        clearAllErrors();
        
        try {
            const response = await organisationService.updateContactInfo(organisationId, contactData);
            
            if (response.success) {
                setOrganisation(prev => {
                    if (!prev) return prev;
                    
                    return {
                        ...prev,
                        organisationDetails: {
                            ...prev.organisationDetails,
                            contact: response.data.organisation.organisationDetails.contact
                        }
                    };
                });
                setError(
                    'Contact information updated successfully!',
                    'Update Complete',
                    'success'
                );
                getUserOrganisations();
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Update Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update contact information.';
            setError(message, 'Update Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    // Update address information
    const updateAddressInfo = async (organisationId, addressData) => {
        startLoading('Updating address information...');
        clearAllErrors();
        
        try {
            const response = await organisationService.updateAddressInfo(organisationId, addressData);
            
            if (response.success) {
                setOrganisation(prev => {
                    if (!prev) return prev;
                    
                    return {
                        ...prev,
                        organisationDetails: {
                            ...prev.organisationDetails,
                            address: {
                                ...prev.organisationDetails?.address,
                                street: response.data.organisation.organisationDetails.address.street
                            }
                        }
                    };
                });
                setError(
                    'Address information updated successfully!',
                    'Update Complete',
                    'success'
                );
                getUserOrganisations();
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Update Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update address information.';
            setError(message, 'Update Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    // Update banking information
    const updateBankingInfo = async (organisationId, bankingData) => {
        startLoading('Updating banking information...');
        clearAllErrors();
        
        try {
            const response = await organisationService.updateBankingInfo(organisationId, bankingData);
            
            if (response.success) {
                setOrganisation(prev => {
                    if (!prev) return prev;
                    
                    return {
                        ...prev,
                        organisationDetails: {
                            ...prev.organisationDetails,
                            banking: response.data.organisation.organisationDetails.banking
                        }
                    };
                });
                setError(
                    'Banking information updated successfully!',
                    'Update Complete',
                    'success'
                );
                getUserOrganisations();
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Update Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update banking information.';
            setError(message, 'Update Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    // Update business information
    const updateBusinessInfo = async (organisationId, businessData) => {
        startLoading('Updating business information...');
        clearAllErrors();
        
        try {
            const response = await organisationService.updateBusinessInfo(organisationId, businessData);
            
            if (response.success) {
                setOrganisation(prev => {
                    if (!prev) return prev;
                    
                    return {
                        ...prev,
                        organisationDetails: {
                            ...prev.organisationDetails,
                            businessInfo: response.data.organisation.organisationDetails.businessInfo,
                            ...(response.data.organisation.organisationDetails.firstEmployeeDate && {
                                firstEmployeeDate: response.data.organisation.organisationDetails.firstEmployeeDate
                            })
                        }
                    };
                });
                setError(
                    'Business information updated successfully!',
                    'Update Complete',
                    'success'
                );
                getUserOrganisations();
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Update Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update business information.';
            setError(message, 'Update Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    // Resubmit organisation for approval
    const resubmitForApproval = async (organisationId) => {
        startLoading('Resubmitting organisation for approval...');
        clearAllErrors();
        
        try {
            const response = await organisationService.resubmitForApproval(organisationId);
            
            if (response.success) {
                // Update the organisation status in context
                setOrganisation(prev => {
                    if (!prev) return prev;
                    
                    return {
                        ...prev,
                        status: 'submitted',
                        submittedAt: response.data.organisation.submittedAt,
                        // Clear rejection details
                        rejectedAt: undefined
                    };
                });
                
                setError(
                    'Organisation resubmitted for approval successfully!',
                    'Resubmission Complete',
                    'success'
                );
                getUserOrganisations();
                return { success: true, data: response.data };
            } else {
                setError(response.message, 'Resubmission Failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to resubmit organisation for approval.';
            setError(message, 'Resubmission Error');
            return { success: false, message };
        } finally {
            stopLoading();
        }
    };

    const value = {
        organisation,
        documents,
        verificationDetails,
        organisationRegDetails,
        verifyOrganisationDetails,
        uploadDocument,
        submitForApproval,
        loadDocuments,
        clearOrganisationData,
        updateOrganisationDetails,
        getUserOrganisations,
        linkOrganisation,
        uploadSignedForm,
        viewDocument,
        downloadDocument,
        getOrganisationWithDocuments,
        updateContactInfo,
        updateAddressInfo,
        updateBankingInfo,
        updateBusinessInfo,
        resubmitForApproval,
        updateDocument,
    };

    return (
        <OrganisationContext.Provider value={value}>
            {children}
        </OrganisationContext.Provider>
    );
};

export const useOrganisation = () => {
    const context = useContext(OrganisationContext);
    if (!context) {
        throw new Error('useOrganisation must be used within an OrganisationProvider');
    }
    return context;
};