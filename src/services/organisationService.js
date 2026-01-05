import apiClient from './api/apiClient';
import { ORGANISATION_ENDPOINTS } from './api/apiEndpoints';

class OrganisationService {
    // Verify organisation details
    async verifyDetails(organisationData) {
        const response = await apiClient.post(ORGANISATION_ENDPOINTS.VERIFY_DETAILS, organisationData);
        return response.data;
    }

    // Upload single document
    async uploadDocument(formData) {
        const response = await apiClient.post(ORGANISATION_ENDPOINTS.UPLOAD_DOCUMENT, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Update document
    async updateDocument(organisationId, documentId, documentType, formData) {
        const response = await apiClient.put(
            `/organisations/${organisationId}/documents/${documentId}/type/${documentType}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    async updateOrganisationDetails(organisationId, organisationData) {
        const response = await apiClient.put(
            ORGANISATION_ENDPOINTS.UPDATE_ORGANISATION_DETAILS.replace(':id', organisationId),
            organisationData
        );
        return response.data;
    }

    // Get all organisations for current user
    async getUserOrganisations() {
        const response = await apiClient.get(ORGANISATION_ENDPOINTS.GET_USER_ORGANISATIONS);
        return response.data;
    }

    // Upload multiple documents
    async uploadMultipleDocuments(documentsData) {
        const formData = new FormData();
        
        // Append each file
        documentsData.files.forEach((file) => {
            formData.append('files', file);
        });
        
        formData.append('documentType', documentsData.documentType);
        
        if (documentsData.organisationType) {
            formData.append('organisationType', documentsData.organisationType);
        }
        
        if (documentsData.organisationId) {
            formData.append('organisationId', documentsData.organisationId);
        }

        const response = await apiClient.post(ORGANISATION_ENDPOINTS.UPLOAD_MULTIPLE_DOCUMENTS, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Delete document
    async deleteDocument(documentId) {
        const response = await apiClient.delete(
            ORGANISATION_ENDPOINTS.DELETE_DOCUMENT.replace(':id', documentId)
        );
        return response.data;
    }

    // Get organisation profile
    async getProfile() {
        const response = await apiClient.get(ORGANISATION_ENDPOINTS.GET_PROFILE);
        return response.data;
    }

    // Submit organisation for approval
    async submitForApproval(organisationDetails) {
        const response = await apiClient.post(ORGANISATION_ENDPOINTS.SUBMIT_FOR_APPROVAL, { organisationDetails });
        return response.data;
    }

    // Get all documents for organisation
    async getDocuments() {
        const response = await apiClient.get(ORGANISATION_ENDPOINTS.GET_DOCUMENTS);
        return response.data;
    }

    // Update organisation profile
    async updateOrganisation(organisationData) {
        const response = await apiClient.put(ORGANISATION_ENDPOINTS.UPDATE_ORGANISATION, organisationData);
        return response.data;
    }

    // Create new organisation
    async createOrganisation(organisationData) {
        const response = await apiClient.post(ORGANISATION_ENDPOINTS.CREATE_ORGANISATION, organisationData);
        return response.data;
    }

    // Get organisation status
    async getOrganisationStatus() {
        const response = await apiClient.get('/organisations/status');
        return response.data;
    }

    async linkOrganisation(cfRegistrationNumber) {
        const response = await apiClient.post('/organisations/link', {
            cfRegistrationNumber
        });
        return response.data;
    }

    // Upload signed linking form
    async uploadSignedForm(formData) {
        const response = await apiClient.post('/organisations/upload-signed-form', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async viewDocument(filename) {
        const response = await apiClient.get(
            ORGANISATION_ENDPOINTS.VIEW_DOCUMENT.replace(':filename', filename),
            {
                responseType: 'blob' // Important for file downloads
            }
        );
        return response;
    }

    // Download document
    async downloadDocument(filename) {
        const response = await apiClient.get(
            ORGANISATION_ENDPOINTS.DOWNLOAD_DOCUMENT.replace(':filename', filename),
            {
                responseType: 'blob' // Important for file downloads
            }
        );
        return response;
    }

    // Get organisation by ID (for detailed view with documents)
    async getOrganisationById(organisationId) {
        const response = await apiClient.get(
            ORGANISATION_ENDPOINTS.GET_ORGANISATION_BY_ID.replace(':id', organisationId)
        );
        return response.data;
    }

    // Update contact information
    async updateContactInfo(organisationId, contactData) {
        const response = await apiClient.put(
            `/organisations/${organisationId}/contact`,
            { contact: contactData }
        );
        return response.data;
    }

    // Update address information
    async updateAddressInfo(organisationId, addressData) {
        const response = await apiClient.put(
            `/organisations/${organisationId}/address`,
            { address: addressData }
        );
        return response.data;
    }

    // Update banking information
    async updateBankingInfo(organisationId, bankingData) {
        const response = await apiClient.put(
            `/organisations/${organisationId}/banking`,
            { banking: bankingData }
        );
        return response.data;
    }

    // Update business information
    async updateBusinessInfo(organisationId, businessData) {
        const response = await apiClient.put(
            `/organisations/${organisationId}/business`,
            businessData
        );
        return response.data;
    }

     // Resubmit organisation for approval
    async resubmitForApproval(organisationId) {
        const response = await apiClient.put(
            `/organisations/${organisationId}/resubmit`
        );
        return response.data;
    }
}

export default new OrganisationService();