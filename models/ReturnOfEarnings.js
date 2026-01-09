const mongoose = require('mongoose');

const roeSchema = new mongoose.Schema({
  cfRegistrationNumber: {
    type: String,
    required: true,
    index: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentYear: {
    type: Number,
    required: true
  },
  employeesEarnings: {
    type: Number,
    default: 0
  },
  numberOfEmployees: {
    type: Number,
    default: 0
  },
  directorsEarnings: {
    type: Number,
    default: 0
  },
  numberOfDirectors: {
    type: Number,
    default: 0
  },
  accommodationMeals: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'processed', 'approved', 'rejected'],
    default: 'submitted'
  },
  comments: {
    type: String
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
  }]
}, {
  timestamps: true
});

roeSchema.index({ cfRegistrationNumber: 1, assessmentYear: 1 }, { unique: false });

module.exports = mongoose.model('ReturnOfEarnings', roeSchema);
