const Organisation = require('../../models/Organisation');
const User = require('../../models/User');
const { sendLinkingEmail, sendLinkingConfirmationEmail } = require('../../utils/emailService');
const { generateLinkingForm } = require('../../utils/pdfGenerator');

// Link organisation by CF registration number
const linkOrganisation = async (req, res) => {
  try {
    const { cfRegistrationNumber } = req.body;
    const userId = req.user._id;

    // Validate CF number
    if (!cfRegistrationNumber || !cfRegistrationNumber.startsWith('99') || cfRegistrationNumber.length !== 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CF Registration Number'
      });
    }

    // Find organisation by CF number
    const organisation = await Organisation.findOne({ 
      cfRegistrationNumber 
    }).populate('userId', 'name surname email');

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found with this CF Registration Number'
      });
    }

    // Check if user is already linked
    const alreadyLinked = organisation.linkedUsers.some(
      linkedUser => linkedUser.userId.toString() === userId.toString()
    );

    if (alreadyLinked) {
      return res.status(409).json({
        success: false,
        message: 'You are already linked to this organisation'
      });
    }

    // Check user limit
    if (organisation.linkedUsers.length >= organisation.maxLinkedUsers) {
      return res.status(400).json({
        success: false,
        message: 'This organisation has reached the maximum number of linked users (10)'
      });
    }

    // Get current user
    const user = await User.findById(userId);

    // Generate linking form DOCX (using the fixed function)
    const { docxBuffer, fileName } = await generateLinkingForm(organisation, user);

    // Send email with template and attachment DOCX
    await sendLinkingEmail(organisation, user, docxBuffer);

    // Add user to linked users (pending status)
    organisation.linkedUsers.push({
      userId: userId,
      status: 'pending',
      linkedAt: new Date()
    });

    await organisation.save();

    res.status(200).json({
      success: true,
      message: 'Linking request sent successfully. Please check your email for the linking form.',
      data: {
        organisation: {
          id: organisation._id,
          tradingName: organisation.organisationDetails?.tradingName,
          registrationNumber: organisation.registrationNumber,
          cfRegistrationNumber: organisation.cfRegistrationNumber
        },
        nextStep: 'upload-form'
      }
    });

  } catch (error) {
    console.error('Link organisation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error linking organisation'
    });
  }
};

// Upload signed linking form
const uploadSignedForm = async (req, res) => {
  try {
    const { organisationId } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const organisation = await Organisation.findById(organisationId);

    if (!organisation) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(404).json({
        success: false,
        message: 'Organisation not found'
      });
    }

    // Find and update the linked user record
    const linkedUser = organisation.linkedUsers.find(
      user => user.userId.toString() === userId.toString()
    );

    if (!linkedUser) {
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(404).json({
        success: false,
        message: 'Linking record not found'
      });
    }

    // Update with signed form
    linkedUser.signedFormUrl = req.file.path;
    linkedUser.status = 'approved'; // Or keep as pending for admin approval

    await organisation.save();

    // Send confirmation emails
    await sendLinkingConfirmationEmail(organisation, req.user);

    res.status(200).json({
      success: true,
      message: 'Signed form uploaded successfully. Your linking request is being processed.',
      data: {
        organisation: {
          id: organisation._id,
          tradingName: organisation.organisationDetails?.tradingName
        }
      }
    });

  } catch (error) {
    console.error('Upload signed form error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({
      success: false,
      message: 'Error uploading signed form'
    });
  }
};

module.exports = {
  linkOrganisation,
  uploadSignedForm
};
