const ReturnOfEarnings = require('../models/ReturnOfEarnings');
const Organisation = require('../models/Organisation');

// Create a new ROE record
const createROE = async (req, res) => {
  try {
    const user = req.user; // set by auth middleware
    const {
      cfRegistrationNumber,
      CFregistrationNumber,
      assessmentYear,
      employeesEarnings = 0,
      directorsEarnings = 0,
      accommodationMeals = 0,
      numberOfEmployees = 0,
      numberOfDirectors = 0,
      comments
    } = req.body;

    // accept either `cfRegistrationNumber` or `CFregistrationNumber` from client
    const cfReg = cfRegistrationNumber || CFregistrationNumber;

    if (!cfReg || !assessmentYear) {
      return res.status(400).json({ success: false, message: 'cfRegistrationNumber and assessmentYear are required' });
    }

    // find organisation by its cfRegistrationNumber field
    const org = await Organisation.findOne({ cfRegistrationNumber: cfReg });
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organisation not found' });
    }

    const totalEarnings = Number(employeesEarnings || 0) + Number(directorsEarnings || 0) + Number(accommodationMeals || 0);

    // check for existing ROE for this cfRegistrationNumber and assessmentYear
    const existingROE = await ReturnOfEarnings.findOne({
      cfRegistrationNumber: org.cfRegistrationNumber,
      assessmentYear: Number(assessmentYear)
    });

    // Helper to build document metadata
    const buildDocMeta = (file) => ({
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      documentType: req.body.documentType || 'ROE_Document',
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadDate: new Date()
    });

    if (existingROE) {
      // If a file is provided, ensure duplicate document types are not added
      if (req.file) {
        const documentType = req.body.documentType || 'ROE_Document';
        const docExists = existingROE.documents.some(d => d.documentType === documentType);
        if (docExists) {
          return res.status(409).json({ success: false, message: `Document of type ${documentType} already exists for this ROE` });
        }

        // attach document metadata
        existingROE.documents.push(buildDocMeta(req.file));
      }

      // merge any provided numeric/comment updates into existing record
      const updatable = ['employeesEarnings', 'directorsEarnings', 'accommodationMeals', 'numberOfEmployees', 'numberOfDirectors', 'comments'];
      updatable.forEach(key => {
        if (req.body[key] !== undefined) existingROE[key] = req.body[key];
      });

      // recalc total
      existingROE.totalEarnings = Number(existingROE.employeesEarnings || 0) + Number(existingROE.directorsEarnings || 0) + Number(existingROE.accommodationMeals || 0);

      await existingROE.save();
      return res.status(200).json({ success: true, message: 'ROE updated with document/fields', data: existingROE });
    }

    // create new ROE entry when none exists
    const roe = new ReturnOfEarnings({
      cfRegistrationNumber: org.cfRegistrationNumber,
      processedBy: user._id,
      assessmentYear: Number(assessmentYear),
      employeesEarnings: Number(employeesEarnings || 0),
      numberOfEmployees: Number(numberOfEmployees || 0),
      directorsEarnings: Number(directorsEarnings || 0),
      numberOfDirectors: Number(numberOfDirectors || 0),
      accommodationMeals: Number(accommodationMeals || 0),
      totalEarnings,
      comments
    });

    // If a file was uploaded, attach metadata (controller does not store file to disk)
    if (req.file) {
      roe.documents.push(buildDocMeta(req.file));
    }

    await roe.save();

    res.status(201).json({ success: true, data: roe });
  } catch (error) {
    console.error('Create ROE error:', error);
    res.status(500).json({ success: false, message: 'Error creating ROE' });
  }
};

// Get ROEs for an organisation
const getROEsByOrganisation = async (req, res) => {
  try {
    const { cfRegistrationNumber, CFregistrationNumber } = req.params;
    const cfRegParam = cfRegistrationNumber || CFregistrationNumber;
    const roes = await ReturnOfEarnings.find({ cfRegistrationNumber: cfRegParam }).populate('processedBy', '-password');
    res.status(200).json({ success: true, data: roes });
  } catch (error) {
    console.error('Get ROEs error:', error);
    res.status(500).json({ success: false, message: 'Error fetching ROEs' });
  }
};

// Get single ROE
const getROE = async (req, res) => {
  try {
    const { id } = req.params;
    const roe = await ReturnOfEarnings.findById(id).populate('processedBy', '-password');
    if (!roe) return res.status(404).json({ success: false, message: 'ROE not found' });
    res.status(200).json({ success: true, data: roe });
  } catch (error) {
    console.error('Get ROE error:', error);
    res.status(500).json({ success: false, message: 'Error fetching ROE' });
  }
};

// Update ROE (allow status, earnings, comments updates)
const updateROE = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const roe = await ReturnOfEarnings.findById(id);
    if (!roe) return res.status(404).json({ success: false, message: 'ROE not found' });

    // Apply allowed updates
    const allowed = ['employeesEarnings', 'directorsEarnings', 'accommodationMeals', 'numberOfEmployees', 'numberOfDirectors', 'status', 'comments', 'assessmentYear'];
    allowed.forEach(key => {
      if (updates[key] !== undefined) roe[key] = updates[key];
    });

    // Recalculate total
    roe.totalEarnings = Number(roe.employeesEarnings || 0) + Number(roe.directorsEarnings || 0) + Number(roe.accommodationMeals || 0);

    // If a file was uploaded, attach
    if (req.file) {
      const file = req.file;
      const doc = {
        filename: file.filename || file.originalname,
        originalName: file.originalname,
        documentType: req.body.documentType || 'ROE_Document',
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadDate: new Date()
      };
      roe.documents.push(doc);
    }

    await roe.save();
    res.status(200).json({ success: true, data: roe });
  } catch (error) {
    console.error('Update ROE error:', error);
    res.status(500).json({ success: false, message: 'Error updating ROE' });
  }
};

// Submit ROE - accepts full payload including finalAssessment, provisionalAssessment, documents array
const submitROE = async (req, res) => {
  try {
    const user = req.user; // set by auth middleware
    const payload = req.body || {};

    const {
      cfRegistrationNumber,
      CFregistrationNumber,
      assessmentYear,
      documents = [],
      finalAssessment = {},
      provisionalAssessment = {},
      comment,
    } = payload;

    const cfReg = cfRegistrationNumber || CFregistrationNumber;
    if (!cfReg || !assessmentYear) {
      return res.status(400).json({ success: false, message: 'cfRegistrationNumber and assessmentYear are required' });
    }

    // find organisation
    const org = await Organisation.findOne({ cfRegistrationNumber: cfReg });
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organisation not found' });
    }

    // Build base ROE object
    const roeData = {
      cfRegistrationNumber: org.cfRegistrationNumber,
      processedBy: user._id,
      assessmentYear: Number(assessmentYear),
      status: 'submitted',
      comments: comment || payload.comments || '',
    };

    // Map finalAssessment and provisionalAssessment into the document
    const mapAssessment = (a) => ({
      employeesEarnings: Number(a.employeesEarnings || 0),
      directorsEarnings: Number(a.directorsEarnings || 0),
      accommodationAndMeals: Number(a.accommodationAndMeals || a.accommodationMeals || 0),
      totalEarnings: Number(a.totalEarnings || 0),
      comment: a.comment || ''
    });

    roeData.finalAssessment = mapAssessment(finalAssessment);
    roeData.provisionalAssessment = mapAssessment(provisionalAssessment);

    // If top-level numeric fields are provided, keep them too for backwards compatibility
    if (payload.employeesEarnings !== undefined) roeData.employeesEarnings = Number(payload.employeesEarnings);
    if (payload.directorsEarnings !== undefined) roeData.directorsEarnings = Number(payload.directorsEarnings);
    if (payload.accommodationMeals !== undefined) roeData.accommodationMeals = Number(payload.accommodationMeals);
    if (payload.totalEarnings !== undefined) roeData.totalEarnings = Number(payload.totalEarnings);

    // Attach provided documents metadata if any (expecting array of objects with filename/originalName/documentType...)
    roeData.documents = Array.isArray(documents) ? documents.map(d => ({
      filename: d.filename || d.fileName || d.originalName || '',
      originalName: d.originalName || d.original || d.filename || '',
      documentType: d.documentType || 'ROE_Document',
      fileSize: d.fileSize || d.size || 0,
      mimeType: d.mimeType || d.type || ''
    })) : [];

    // Create the ROE
    const roe = new ReturnOfEarnings(roeData);
    await roe.save();

    res.status(201).json({ success: true, message: 'ROE submitted', data: roe });
  } catch (error) {
    console.error('Submit ROE error:', error);
    res.status(500).json({ success: false, message: 'Error submitting ROE' });
  }
};

module.exports = {
  createROE,
  getROEsByOrganisation,
  getROE,
  updateROE,
  submitROE
};
