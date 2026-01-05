const {
  verifyOrganisationDetails
} = require('./organisationControllers/organisationVerificationController');

const {
  uploadDocument,
  updateDocument
} = require('./organisationControllers/organisationDocumentsController');

const {
  getOrganisationProfile,
  getUserOrganisations,
  getAllOrganisations,
  getOrganisationById
} = require('./organisationControllers/organisationProfileController');

const {
  submitForApproval,
  resubmitForApproval,
  approveOrganisation,
  rejectOrganisation
} = require('./organisationControllers/organisationApprovalController');

const {
  updateOrganisationDetails,
  updateContactInfo,
  updateAddressInfo,
  updateBankingInfo,
  updateBusinessInfo
} = require('./organisationControllers/organisationUpdateController');

const {
  linkOrganisation,
  uploadSignedForm
} = require('./organisationControllers/organisationLinkingController');

module.exports = {
  verifyOrganisationDetails,
  uploadDocument,
  updateDocument,
  getOrganisationProfile,
  getUserOrganisations,
  getAllOrganisations,
  getOrganisationById,
  submitForApproval,
  resubmitForApproval,
  approveOrganisation,
  rejectOrganisation,
  updateOrganisationDetails,
  updateContactInfo,
  updateAddressInfo,
  updateBankingInfo,
  updateBusinessInfo,
  linkOrganisation,
  uploadSignedForm
};
