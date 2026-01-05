const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // required removed to make it optional as per user request
    },
    organisationType: {
        type: String,
        required: true,
        enum: [
            'Body Corporate', 
            'Trust Number', 
            'Domestic Employer', 
            'NPO Number', 
            'School', 
            'Sole Proprietor', 
            'Company Registration Number'
        ]
    },
    registrationNumber: {
        type: String,
        required: function() {
            return [
                'Body Corporate', 
                'Trust Number', 
                'NPO Number', 
                'School', 
                'Company Registration Number'
            ].includes(this.organisationType);
        }
    },
    identityNumber: {
        type: [String],
        required: function() {
            return [
                'Domestic Employer', 
                'Sole Proprietor', 
                'Company Registration Number'
            ].includes(this.organisationType);
        }
    },
    taxNumber: {
        type: String,
        required: function() {
            return this.organisationType === 'Company Registration Number';
        }
    },
    organisationDetails: {
        ownershipType: String,
        tradingName: String,
        firstEmployeeDate: Date,
        address: {
            street: {
                number: String,
                name: String,
                suburb: String,
                city: String,
                province: String,
                postalCode: String
            },
            postal: {
                poBox: String,
                suburb: String,
                postalCode: String
            }
        },
        contact: {
            person: String,
            telephone: String,
            cellphone: String,
            email: String
        },
        banking: {
            bankName: String,
            accountHolder: String,
            accountNumber: String,
            branchCode: String
        },
        businessInfo: {
            numberOfEmployees: Number,
            industries: [String]
        }
    },
    documents: [{
        filename: String,
        originalName: String,
        documentType: String,
        fileSize: Number,
        mimeType: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected'],
        default: 'draft'
    },
    submittedAt: Date,
    approvedAt: Date,
    approvalDetails: {
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: Date,
        notes: String
    },
    rejectionDetails: {
        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rejectedAt: Date,
        reason: String,
        notes: String
    },
    cfRegistrationNumber: {
        type: String,
        unique: true,
        sparse: true 
    },
    bpNumber: {
        type: String,
        unique: true,
        sparse: true 
    },
    linkedUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        linkedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        signedFormUrl: String
    }],
    maxLinkedUsers: {
        type: Number,
        default: 10
    }
}, {
    timestamps: true
});

organisationSchema.index({ userId: 1 });
organisationSchema.index({ registrationNumber: 1 });

module.exports = mongoose.model('Organisation', organisationSchema);