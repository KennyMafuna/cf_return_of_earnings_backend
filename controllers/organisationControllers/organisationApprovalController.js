const Organisation = require('../../models/Organisation');
const { sendApprovalEmail } = require('../../utils/emailService');

// Submit organisation for approval
const submitForApproval = async (req, res) => {
  try {

    const organisation = await Organisation.findOne({ 
      registrationNumber: req.body.organisationDetails.registrationNumber,
      identityNumber: req.body.organisationDetails.identityNumber,
      organisationType: req.body.organisationDetails.organisationType,
      taxNumber: req.body.organisationDetails.taxNumber
    });

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'No draft organisation found to submit'
      });
    }

    // Check if all required documents are uploaded
    const requiredDocumentTypes = ['Id_Copy', 'CIPC_Certificate', 'Business_Address'];
    const uploadedDocumentTypes = organisation.documents.map(doc => doc.documentType);
    
    const missingDocuments = requiredDocumentTypes.filter(
      type => !uploadedDocumentTypes.includes(type)
    );

    if (missingDocuments.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required documents: ${missingDocuments.join(', ')}`
      });
    }

    // Update organisation status
    organisation.status = 'submitted';
    organisation.submittedAt = new Date();

    // Add user to linkedUsers with approved status
    if (!organisation.linkedUsers) {
      organisation.linkedUsers = [];
    }
    const userId = req.user._id;

    const existingLink = organisation.linkedUsers.find(link => link.userId.toString() === userId.toString());
    if (!existingLink) {
      organisation.linkedUsers.push({
        userId: userId,
        status: 'approved',
        linkedAt: new Date()
      });
    }

    await organisation.save();

    res.status(200).json({
      success: true,
      message: 'Organisation submitted for approval successfully',
      data: {
        organisation: {
          id: organisation._id,
          status: organisation.status,
          submittedAt: organisation.submittedAt
        }
      }
    });

  } catch (error) {
    console.error('Submit for approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting organisation for approval'
    });
  }
};

// Resubmit organisation for approval
const resubmitForApproval = async (req, res) => {
  try {
    const { organisationId } = req.params;
    const userId = req.user._id;

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

    // Check if organisation is in rejected status
    if (organisation.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Organisation can only be resubmitted if it was previously rejected'
      });
    }

    // Update organisation status and clear rejection details
    organisation.status = 'submitted';
    organisation.submittedAt = new Date();
    
    // Clear rejection details
    organisation.rejectedAt = undefined;
    if (organisation.approvalDetails) {
      organisation.approvalDetails.notes = undefined;
    }

    await organisation.save();

    res.status(200).json({
      success: true,
      message: 'Organisation resubmitted for approval successfully',
      data: {
        organisation: {
          id: organisation._id,
          status: organisation.status,
          submittedAt: organisation.submittedAt
        }
      }
    });

  } catch (error) {
    console.error('Resubmit for approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resubmitting organisation for approval'
    });
  }
};

// Approve organisation
const approveOrganisation = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalNotes, cfRegistrationNumber } = req.body;

    const organisation = await Organisation.findById(id)
      .populate('userId', 'name surname email phoneNumber'); // Populate user data

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found'
      });
    }

    // Check if organisation is in submitted status
    if (organisation.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: `Organisation must be in submitted status. Current status: ${organisation.status}`
      });
    }

    // Generate or use provided CF Registration Number
    const finalCfNumber = cfRegistrationNumber || generateCfRegistrationNumber();
    const finalBpNumber = generateBpNumber();
    
    // Update organisation status
    organisation.status = 'approved';
    organisation.verificationStatus = 'verified';
    organisation.approvedAt = new Date();
    organisation.cfRegistrationNumber = finalCfNumber; // Store CF number
    organisation.bpNumber = finalBpNumber; // Store BP number
    
    // Store approval details
    organisation.approvalDetails = {
      approvedBy: 'admin-script',
      approvedAt: new Date(),
      notes: approvalNotes || 'Approved via admin script',
      cfRegistrationNumber: finalCfNumber
    };

    await organisation.save();

    // Send approval email to user
    try {
      await sendApprovalEmail(organisation.organisationDetails.contact.email, {
        tradingName: organisation.organisationDetails?.tradingName,
        registrationNumber: organisation.registrationNumber,
        organisationType: organisation.organisationType,
        taxNumber: organisation.taxNumber,
        cfRegistrationNumber: finalCfNumber,
        bpNumber: finalBpNumber
      });
      console.log('✅ Approval email sent to:', organisation.organisationDetails.contact.email);
    } catch (emailError) {
      console.error('❌ Failed to send approval email:', emailError.message);
      // Don't fail the approval if email fails, just log it
    }

    res.status(200).json({
      success: true,
      message: 'Organisation approved successfully and notification email sent',
      data: {
        organisation: {
          id: organisation._id,
          registrationNumber: organisation.registrationNumber,
          tradingName: organisation.organisationDetails?.tradingName,
          status: organisation.status,
          verificationStatus: organisation.verificationStatus,
          approvedAt: organisation.approvedAt,
          cfRegistrationNumber: finalCfNumber,
          bpNumber: finalBpNumber,
          approvalDetails: organisation.approvalDetails
        }
      }
    });

  } catch (error) {
    console.error('Approve organisation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving organisation'
    });
  }
};

// Reject organisation
const rejectOrganisation = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason, notes } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const organisation = await Organisation.findById(id);

        if (!organisation) {
            return res.status(404).json({
                success: false,
                message: 'Organisation not found'
            });
        }

        // Check if organisation is in submitted status
        if (organisation.status !== 'submitted') {
            return res.status(400).json({
                success: false,
                message: `Organisation must be in submitted status. Current status: ${organisation.status}`
            });
        }

        // Update organisation status
        organisation.status = 'rejected';
        organisation.verificationStatus = 'failed';
        
        // Store rejection details
        organisation.rejectionDetails = {
            rejectedBy: 'admin-script',
            rejectedAt: new Date(),
            reason: rejectionReason,
            notes: notes || 'Rejected via admin script'
        };

        await organisation.save();

        res.status(200).json({
            success: true,
            message: 'Organisation rejected successfully',
            data: {
                organisation: {
                id: organisation._id,
                registrationNumber: organisation.registrationNumber,
                tradingName: organisation.organisationDetails?.tradingName,
                status: organisation.status,
                verificationStatus: organisation.verificationStatus,
                rejectionDetails: organisation.rejectionDetails
                }
            }
        });

    } catch (error) {
        console.error('Reject organisation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting organisation'
        });
    }
};

// Helper function to generate CF Registration Number
const generateCfRegistrationNumber = () => {
    const prefix = '99'; // CF numbers start with 99
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 10);
    return prefix + randomDigits;
};

// Helper function to generate BP Number starting with 2000 and total 10 digits
const generateBpNumber = () => {
    const prefix = '2000';
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    console.log(prefix + randomDigits)
    return prefix + randomDigits;
};

module.exports = {
  submitForApproval,
  resubmitForApproval,
  approveOrganisation,
  rejectOrganisation
};
