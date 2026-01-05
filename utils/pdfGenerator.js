const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf-node');

const generateLinkingForm = async (organisation, user) => {
    try {
        // Load the Word template
        const templatePath = path.join(__dirname, 'templates', 'Enrollment_for_Registration_for_the_Electronic_Submission_of_ROE.docx');
        
        if (!fs.existsSync(templatePath)) {
            throw new Error('Template file not found');
        }

        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Prepare data for template - using the correct field names from your template
        const data = {
            cfRegistrationNumber: organisation.cfRegistrationNumber || 'N/A',
            tradingName: organisation.organisationDetails?.tradingName || organisation.organisationName || 'N/A',
            // User data - match the exact field names from your template
            "user.idNumber": user.idNumber || '',
            "user.surname": user.surname || '',
            "userInitial": user.name ? user.name.charAt(0) : '', // First initial
            "user.email": user.email || '',
        };

        // NEW WAY: Use render() with data directly (instead of deprecated setData())
        doc.render(data);

        // Generate the populated Word document buffer
        const docxBuffer = doc.getZip().generate({ 
            type: 'nodebuffer',
            compression: 'DEFLATE'
        });

        return {
            docxBuffer: docxBuffer,
            fileName: `Linking_Form_${organisation.cfRegistrationNumber || organisation._id}`
        };

    } catch (error) {
        console.error('Document generation error:', error);
        throw new Error(`Failed to generate document: ${error.message}`);
    }
};

module.exports = {
    generateLinkingForm
};


