const express = require('express');
const router = express.Router();
const roeController = require('../controllers/roeController');
const auth = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// Create ROE (optionally upload a single document)
router.post('/documents', auth, uploadSingle, roeController.createROE);

// Submit ROE payload (JSON) - create a submitted ROE record
router.post('/submit', auth, roeController.submitROE);

// Get all ROEs for an organisation (by CF registration number)
router.get('/organisation/:cfRegistrationNumber', auth, roeController.getROEsByOrganisation);

// Get single ROE by id
router.get('/:id', auth, roeController.getROE);

// Update ROE (optionally upload a single document)
router.put('/:id', auth, uploadSingle, roeController.updateROE);

module.exports = router;
