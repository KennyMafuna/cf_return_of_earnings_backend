const express = require('express');
const router = express.Router();
const organisationController = require('../controllers/organisationController');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
// router.use(auth);


router.post('/verify', auth ,organisationController.verifyOrganisationDetails);

router.post('/documents', auth , uploadSingle, organisationController.uploadDocument);

router.put('/:organisationId/documents/:documentId/type/:documentType', auth, uploadSingle, organisationController.updateDocument);

router.get('/profile', auth , organisationController.getOrganisationProfile);

router.post('/submit-approval', auth , organisationController.submitForApproval);

router.get('/documents',  auth, organisationController.getOrganisationProfile); 

router.get('/user-organisations',  auth, organisationController.getUserOrganisations);

router.get('/admin/all', organisationController.getAllOrganisations);

// Routes with hardcoded segments must come BEFORE generic :id params to avoid Express matching the wrong route
router.post('/link', auth, organisationController.linkOrganisation);

router.post('/upload-signed-form', auth, uploadSingle, organisationController.uploadSignedForm);

router.patch('/admin/:id/approve', organisationController.approveOrganisation);

router.patch('/admin/:id/reject', organisationController.rejectOrganisation);

router.put('/:organisationId/resubmit', auth, organisationController.resubmitForApproval);

router.put('/:organisationId/contact', auth, organisationController.updateContactInfo);

router.put('/:organisationId/address', auth, organisationController.updateAddressInfo);

router.put('/:organisationId/banking', auth, organisationController.updateBankingInfo);

router.put('/:organisationId/business', auth, organisationController.updateBusinessInfo);

router.put('/:id/details', auth, organisationController.updateOrganisationDetails);

module.exports = router;