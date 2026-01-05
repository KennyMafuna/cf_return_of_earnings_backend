const Organisation = require('../../models/Organisation');

// Verify organisation details
const verifyOrganisationDetails = async (req, res) => {
  try {
    const { organisationType, registrationNumber, identityNumber, taxNumber } = req.body;

    // Validate required fields based on organisation type
    if (!organisationType) {
      return res.status(400).json({
        success: false,
        message: 'Organisation type is required'
      });
    }

    // Define required fields for each organisation type
    const requiredFields = {
      'Body Corporate': ['registrationNumber'],
      'Trust Number': ['registrationNumber'],
      'Domestic Employer': ['identityNumber'],
      'NPO Number': ['registrationNumber'],
      'School': ['registrationNumber'],
      'Sole Proprietor': ['identityNumber'],
      'Company Registration Number': ['registrationNumber', 'identityNumber', 'taxNumber']
    };

    // Check if organisation type is valid
    if (!requiredFields[organisationType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organisation type'
      });
    }

    // Validate required fields for the specific organisation type
    const missingFields = requiredFields[organisationType].filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields for ${organisationType}: ${missingFields.join(', ')}`
      });
    }

    // Validate registration number format first
    if (registrationNumber) {
      if (!/^\d{4} \/ \d{6} \/ \d{2}$/.test(registrationNumber)) {
        return res.status(404).json({
          success: false,
          message: 'Registration Number is invalid'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Registration Number is required for verification'
      });
    }

    // Find organisation by registrationNumber
    const organisationByReg = await Organisation.findOne({ organisationType, registrationNumber });
    if (!organisationByReg) {
      return res.status(404).json({
        success: false,
        message: 'Organisation with this registration number does not exist'
      });
    }

    // Check if organisation is approved and has cfRegistrationNumber and bpNumber
    if (organisationByReg.status === 'approved' && organisationByReg.cfRegistrationNumber && organisationByReg.bpNumber) {
      return res.status(400).json({
        success: false,
        message: 'This organisation is already approved. Please link to it instead of registering.'
      });
    }

    // Validate identity number format and existence
    if (identityNumber) {
      if (!/^\d{13}$/.test(identityNumber)) {
        return res.status(404).json({
          success: false,
          message: 'Identity Number is invalid'
        });
      }
      // Defensive check if identityNumber array exists and includes input
      if (!Array.isArray(organisationByReg.identityNumber) || organisationByReg.identityNumber.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Organisation identity number data is missing'
        });
      }
      if (!organisationByReg.identityNumber.includes(identityNumber.trim())) {
        return res.status(404).json({
          success: false,
          message: 'Organisation exists, Identity number incorrect'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Identity Number is required for verification'
      });
    }

    // Validate tax number format and existence
    if (taxNumber) {
      if (!/^\d{10}$/.test(taxNumber)) {
        return res.status(404).json({
          success: false,
          message: 'Tax Number is invalid'
        });
      }
      // Defensive check for taxNumber presence and non-empty string
      if (!organisationByReg.taxNumber || organisationByReg.taxNumber.trim() === '') {
        return res.status(404).json({
          success: false,
          message: 'Organisation tax number data is missing'
        });
      }
      if (organisationByReg.taxNumber.trim() !== taxNumber.trim()) {
        return res.status(404).json({
          success: false,
          message: 'Organisation exists, Tax number incorrect'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tax Number is required for verification'
      });
    }

    // All validations passed, return organisationDetails
    res.status(200).json({
      success: true,
      message: 'Organisation verified successfully',
      data: {
        organisationDetails: organisationByReg.organisationDetails || {},
        organisationDocuments: organisationByReg.documents || {},

      }
    });
    
  } catch (error) {
    console.error('Verify organisation details error:', error);

    return res.status(500).json({
      success: false,
      message: 'Error verifying organisation details'
    });
  }
};

module.exports = {
  verifyOrganisationDetails,
};
