const Organisation = require('../../models/Organisation');

// Get organisation profile
const getOrganisationProfile = async (req, res) => {
  try {
    const organisation = await Organisation.findOne({ 
      userId: req.user._id 
    }).populate('userId', 'name surname email phoneNumber');

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'No organisation found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        organisation: {
          id: organisation._id,
          organisationType: organisation.organisationType,
          registrationNumber: organisation.registrationNumber,
          identityNumber: organisation.identityNumber,
          taxNumber: organisation.taxNumber,
          verificationStatus: organisation.verificationStatus,
          status: organisation.status,
          documents: organisation.documents,
          submittedAt: organisation.submittedAt,
          approvedAt: organisation.approvedAt,
          user: organisation.userId
        }
      }
    });

  } catch (error) {
    console.error('Get organisation profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organisation profile'
    });
  }
};

// Get all organisations for current user (owned + linked)
const getUserOrganisations = async (req, res) => {
    try {
        const userId = req.user._id;

        const ownedOrganisations = await Organisation.find({ 
            userId: userId 
        }).sort({ createdAt: -1 }); 

        const linkedOrganisations = await Organisation.find({
            'linkedUsers.userId': userId,
            'linkedUsers.status': 'approved'
        }).sort({ createdAt: -1 }); 

        const allOrganisationsMap = new Map();

        ownedOrganisations.forEach(org => {
            allOrganisationsMap.set(org._id.toString(), {
                ...org.toObject(),
                userRole: 'owner',
                linkingStatus: 'owner',
                isOwner: true,
                isLinkedUser: false,
            });
        });

        linkedOrganisations.forEach(org => {
            const orgId = org._id.toString();
            if (!allOrganisationsMap.has(orgId)) {
                const userLink = org.linkedUsers.find(
                    link => link.userId.toString() === userId.toString()
                );
                
                // Only add if userLink exists AND status is 'approved'
                if (userLink && userLink.status === 'approved') {
                    allOrganisationsMap.set(orgId, {
                        ...org.toObject(),
                        userRole: 'linked_user', 
                        linkingStatus: userLink.status,
                        linkedAt: userLink.linkedAt,
                        signedFormUrl: userLink.signedFormUrl,
                        isLinkedUser: true,
                        isOwner: false,
                    });
                }
            }
        });

        const allOrganisations = Array.from(allOrganisationsMap.values());

        res.status(200).json({
            success: true,
            data: {
                organisations: allOrganisations.map(org => {
                    const organisationData = {
                        id: org._id,
                        organisationType: org.organisationType,
                        registrationNumber: org.registrationNumber,
                        taxNumber: org.taxNumber,
                        verificationStatus: org.verificationStatus,
                        status: org.status,
                        createdAt: org.createdAt,
                        submittedAt: org.submittedAt,
                        approvedAt: org.approvedAt,
                        rejectedAt: org.rejectionDetails,
                        organisationDetails: org.organisationDetails,
                        userRole: org.userRole, 
                        linkingStatus: org.linkingStatus,
                        isLinkedUser: org.isLinkedUser,
                        isOwner: org.isOwner,
                        documents: org.documents,
                    };

                    if (org.status === 'approved') {
                        organisationData.cfRegistrationNumber = org.cfRegistrationNumber;
                        organisationData.bpNumber = org.bpNumber;
                    }

                    if (org.userRole === 'linked_user') {
                        organisationData.linkedAt = org.linkedAt;
                        organisationData.hasSignedForm = !!org.signedFormUrl;
                    }

                    return organisationData;
                }),
                summary: {
                    total: allOrganisations.length,
                    owned: ownedOrganisations.length,
                    linked: linkedOrganisations.length
                }
            }
        });

    } catch (error) {
        console.error('Get user organisations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user organisations'
        });
    }
};

// Get all organisations (for testing - no auth)
const getAllOrganisations = async (req, res) => {
    try {
        const organisations = await Organisation.find()
        .populate('userId', 'name surname email phoneNumber')
        .sort({ createdAt: -1 });

        res.status(200).json({
        success: true,
        data: {
            organisations: organisations.map(org => ({
                id: org._id,
                organisationType: org.organisationType,
                registrationNumber: org.registrationNumber,
                tradingName: org.organisationDetails?.tradingName,
                status: org.status,
                verificationStatus: org.verificationStatus,
                submittedAt: org.submittedAt,
                createdAt: org.createdAt,
                user: org.userId
                }))
            }
        });

    } catch (error) {
        console.error('Get all organisations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organisations'
        });
    }
};

// Get organisation by ID (no auth - for testing)
const getOrganisationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate id format (ObjectId)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({
        success: false,
        message: 'Organisation ID is invalid'
      });
    }

    const organisation = await Organisation.findById(id)
      .populate('userId', 'name surname email phoneNumber');

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation Doesnt seem to exist'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        organisation: {
          id: organisation._id,
          organisationType: organisation.organisationType,
          registrationNumber: organisation.registrationNumber,
          identityNumber: organisation.identityNumber,
          taxNumber: organisation.taxNumber,
          tradingName: organisation.organisationDetails?.tradingName,
          status: organisation.status,
          verificationStatus: organisation.verificationStatus,
          submittedAt: organisation.submittedAt,
          approvedAt: organisation.approvedAt,
          createdAt: organisation.createdAt,
          approvalDetails: organisation.approvalDetails,
          rejectionDetails: organisation.rejectionDetails,
          user: organisation.userId
        }
      }
    });
  } catch (error) {
    console.error('Get organisation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organisation'
    });
  }
};

module.exports = {
  getOrganisationProfile,
  getUserOrganisations,
  getAllOrganisations,
  getOrganisationById
};
