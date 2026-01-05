const Organisation = require('../../models/Organisation');

// Update organisation details
const updateOrganisationDetails = async (req, res) => {
  try {
      const { id } = req.params;
      const { organisationDetails } = req.body;

      const organisation = await Organisation.findOne({ 
          _id: id,
          userId: req.user._id
      });

      if (!organisation) {
          return res.status(404).json({
              success: false,
              message: 'Organisation not found'
          });
      }

      // Update organisation details
      organisation.organisationDetails = {
          ...organisation.organisationDetails,
          ...organisationDetails
      };

      // Check if all required details are provided for auto-submission
      const isComplete = checkOrganisationDetailsComplete(organisation.organisationDetails);
      
      if (isComplete && organisation.status === 'draft') {
          organisation.status = 'submitted';
          organisation.submittedAt = new Date();
      }

      await organisation.save();

      res.status(200).json({
          success: true,
          message: isComplete ? 
              'Organisation details updated and submitted for approval' : 
              'Organisation details updated successfully',
          data: {
              organisation: {
                  id: organisation._id,
                  organisationDetails: organisation.organisationDetails,
                  status: organisation.status,
                  submittedAt: organisation.submittedAt
              }
          }
      });

  } catch (error) {
      console.error('Update organisation details error:', error);
      
      if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({
              success: false,
              message: 'Validation error',
              errors
          });
      }

      res.status(500).json({
          success: false,
          message: 'Error updating organisation details'
      });
  }
};

// Helper function to check if all required details are complete
const checkOrganisationDetailsComplete = (organisationDetails) => {
  if (!organisationDetails) return false;

  const requiredFields = [
      'ownershipType',
      'tradingName', 
      'firstEmployeeDate',
      'address.street.number',
      'address.street.name',
      'address.street.suburb', 
      'address.street.city',
      'address.street.province',
      'address.street.postalCode',
      'contact.person',
      'contact.telephone',
      'contact.cellphone', 
      'contact.email',
      'banking.bankName',
      'banking.accountHolder',
      'banking.accountNumber',
      'banking.branchCode',
      'businessInfo.numberOfEmployees',
      'businessInfo.industries'
  ];

  // Check if all required fields have values
  for (const field of requiredFields) {
      const value = getNestedValue(organisationDetails, field);
      if (!value || (Array.isArray(value) && value.length === 0)) {
          return false;
      }
  }

  return true;
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

// Update contact information 
const updateContactInfo = async (req, res) => {
  try {
      const { organisationId } = req.params;
      const { contact } = req.body;
      const userId = req.user._id;

      // Allow both owners and approved linked users
      const organisation = await Organisation.findOne({
          _id: organisationId,
          $or: [
              { userId: userId }, // Owner
              { 
                  'linkedUsers.userId': userId,
                  'linkedUsers.status': 'approved' 
              } // Approved linked user
          ]
      });

      if (!organisation) {
          return res.status(404).json({
              success: false,
              message: 'Organisation not found or access denied'
          });
      }

      // Ensure organisationDetails exists
      if (!organisation.organisationDetails) {
          organisation.organisationDetails = {};
      }
      
      // Ensure contact exists
      if (!organisation.organisationDetails.contact) {
          organisation.organisationDetails.contact = {};
      }

      // Update contact information
      organisation.organisationDetails.contact = {
          ...organisation.organisationDetails.contact,
          ...contact
      };

      organisation.updatedAt = new Date();
      await organisation.save();

      res.status(200).json({
          success: true,
          message: 'Contact information updated successfully',
          data: { organisation }
      });

  } catch (error) {
      console.error('Update contact info error:', error);
      res.status(500).json({
          success: false,
          message: 'Error updating contact information'
      });
  }
};

// Update address information 
const updateAddressInfo = async (req, res) => {
  try {
      const { organisationId } = req.params;
      const { address } = req.body;
      const userId = req.user._id;

      // Allow both owners and approved linked users
      const organisation = await Organisation.findOne({
          _id: organisationId,
          $or: [
              { userId: userId }, // Owner
              { 
                  'linkedUsers.userId': userId,
                  'linkedUsers.status': 'approved' 
              } // Approved linked user
          ]
      });

      if (!organisation) {
          return res.status(404).json({
              success: false,
              message: 'Organisation not found or access denied'
          });
      }

      // Ensure organisationDetails exists
      if (!organisation.organisationDetails) {
          organisation.organisationDetails = {};
      }
      
      // Ensure address exists
      if (!organisation.organisationDetails.address) {
          organisation.organisationDetails.address = {};
      }
      
      // Ensure street exists
      if (!organisation.organisationDetails.address.street) {
          organisation.organisationDetails.address.street = {};
      }

      // Update address information
      organisation.organisationDetails.address.street = {
          ...organisation.organisationDetails.address.street,
          ...address
      };

      organisation.updatedAt = new Date();
      await organisation.save();

      res.status(200).json({
          success: true,
          message: 'Address information updated successfully',
          data: { organisation }
      });

  } catch (error) {
      console.error('Update address info error:', error);
      res.status(500).json({
          success: false,
          message: 'Error updating address information'
      });
  }
};

// Update banking information
const updateBankingInfo = async (req, res) => {
  try {
      const { organisationId } = req.params;
      const { banking } = req.body;
      const userId = req.user._id;

      // Allow both owners and approved linked users
      const organisation = await Organisation.findOne({
          _id: organisationId,
          $or: [
              { userId: userId }, // Owner
              { 
                  'linkedUsers.userId': userId,
                  'linkedUsers.status': 'approved' 
              } // Approved linked user
          ]
      });

      if (!organisation) {
          return res.status(404).json({
              success: false,
              message: 'Organisation not found or access denied'
          });
      }

      // Ensure organisationDetails exists
      if (!organisation.organisationDetails) {
          organisation.organisationDetails = {};
      }
      
      // Ensure banking exists
      if (!organisation.organisationDetails.banking) {
          organisation.organisationDetails.banking = {};
      }

      // Update banking information
      organisation.organisationDetails.banking = {
          ...organisation.organisationDetails.banking,
          ...banking
      };

      organisation.updatedAt = new Date();
      await organisation.save();

      res.status(200).json({
          success: true,
          message: 'Banking information updated successfully',
          data: { organisation }
      });

  } catch (error) {
      console.error('Update banking info error:', error);
      res.status(500).json({
          success: false,
          message: 'Error updating banking information'
      });
  }
};

// Update business information 
const updateBusinessInfo = async (req, res) => {
  try {
      const { organisationId } = req.params;
      const { businessInfo, firstEmployeeDate } = req.body;
      const userId = req.user._id;

      // Allow both owners and approved linked users
      const organisation = await Organisation.findOne({
          _id: organisationId,
          $or: [
              { userId: userId }, // Owner
              { 
                  'linkedUsers.userId': userId,
                  'linkedUsers.status': 'approved' 
              } // Approved linked user
          ]
      });

      if (!organisation) {
          return res.status(404).json({
              success: false,
              message: 'Organisation not found or access denied'
          });
      }

      // Ensure organisationDetails exists
      if (!organisation.organisationDetails) {
          organisation.organisationDetails = {};
      }
      
      // Ensure businessInfo exists
      if (!organisation.organisationDetails.businessInfo) {
          organisation.organisationDetails.businessInfo = {};
      }

      // Update business information
      if (businessInfo) {
          organisation.organisationDetails.businessInfo = {
              ...organisation.organisationDetails.businessInfo,
              ...businessInfo
          };
      }

      if (firstEmployeeDate) {
          organisation.organisationDetails.firstEmployeeDate = firstEmployeeDate;
      }

      organisation.updatedAt = new Date();
      await organisation.save();

      res.status(200).json({
          success: true,
          message: 'Business information updated successfully',
          data: { organisation }
      });

  } catch (error) {
      console.error('Update business info error:', error);
      res.status(500).json({
          success: false,
          message: 'Error updating business information'
      });
  }
};

module.exports = {
  updateOrganisationDetails,
  updateContactInfo,
  updateAddressInfo,
  updateBankingInfo,
  updateBusinessInfo
};
