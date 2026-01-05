const Organisation = require('../../models/Organisation');
const path = require('path');
const fs = require('fs');

// Upload a single document
const uploadDocument = async (req, res) => {
    try {
        const { documentType, organisationType, registrationNumber } = req.body;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        if (!documentType) {
            return res.status(400).json({
                success: false,
                message: 'Document type is required'
            });
        }

        // Find organisation for this user
        const organisation = await Organisation.findOne({ 
            registrationNumber: registrationNumber
        });

        if (!organisation) {
            // Note: No file to clean up since it's not saved locally
            return res.status(404).json({
                success: false,
                message: 'No organisation found. Please verify organisation details first.'
            });
        }

        // Define valid document types based on organisation type
        const getValidDocumentTypes = (orgType) => {
            switch(orgType) {
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
                
                default: // Company Registration Number and others
                return ['Id_Copy', 'CIPC_Certificate', 'Business_Address'];
            }
        };

        // Get valid document types for this organisation
        const validDocumentTypes = getValidDocumentTypes(organisation.organisationType);

        // Validate document type against allowed types for this organisation
        if (!validDocumentTypes.includes(documentType)) {
            // Note: No file to clean up since it's not saved locally
            return res.status(400).json({
                success: false,
                message: `Invalid document type for ${organisation.organisationType}. Allowed types: ${validDocumentTypes.join(', ')}`
            });
        }

        // Check if document of same type already exists
        const existingDocument = organisation.documents.find(
            doc => doc.documentType === documentType
        );

        if (existingDocument) {
            // Note: No file to clean up since it's not saved locally
            return res.status(409).json({
                success: false,
                message: `A ${documentType} document already exists. Please remove it first to upload a new one.`
            });
        }

        // Create document record
        const document = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            documentType: documentType,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadDate: new Date()
        };

        organisation.documents.push(document);
        await organisation.save();

        res.status(200).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                document: {
                id: document._id,
                originalName: document.originalName,
                documentType: document.documentType,
                fileSize: document.fileSize,
                uploadDate: document.uploadDate
                }
            }
        });

    } catch (error) {
        console.error('Upload document error:', error);

        // Note: No file to clean up since it's not saved locally

        res.status(500).json({
            success: false,
            message: 'Error uploading document'
        });
    }
};

// Update existing document
const updateDocument = async (req, res) => {
    try {
        const { organisationId, documentId, documentType } = req.params;
        const userId = req.user._id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        // Allow both owners and approved linked users
        const organisation = await Organisation.findOne({
            _id: organisationId,
            $or: [
                { userId: userId },
                { 
                    'linkedUsers.userId': userId,
                    'linkedUsers.status': 'approved' 
                }
            ]
        });

        if (!organisation) {
            return res.status(404).json({
                success: false,
                message: 'Organisation not found or access denied'
            });
        }

        // Find the document to update
        const documentIndex = organisation.documents.findIndex(
            doc => doc._id.toString() === documentId
        );

        if (documentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const oldDocument = organisation.documents[documentIndex];

        // Generate new filename (for metadata only, file not saved locally)
        const fileExtension = path.extname(file.originalname);
        const filename = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;

        console.log(documentType)
        
        // Update the document (only metadata, no file saved locally)
        organisation.documents[documentIndex] = {
            ...oldDocument,
            filename: filename,
            originalName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            documentType: documentType,
            uploadDate: new Date()
        };

        await organisation.save();

        res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            data: {
                document: organisation.documents[documentIndex]
            }
        });

    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating document'
        });
    }
};


module.exports = {
  uploadDocument,
  updateDocument
};
