const axios = require('axios');

const verifyRecaptcha = async (req, res, next) => {
    // Always pass in development
    if (process.env.NODE_ENV === 'development') {
        console.log('🚀 DEVELOPMENT: Skipping reCAPTCHA middleware');
        return next();
    }

    // Only verify in production
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
        return res.status(400).json({
        success: false,
        message: 'reCAPTCHA token is required'
        });
    }

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        });

        const data = await response.json();

        if (!data.success) {
        return res.status(400).json({
            success: false,
            message: 'reCAPTCHA verification failed'
        });
        }

        next();
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        res.status(500).json({
        success: false,
        message: 'Error verifying reCAPTCHA'
        });
    }
};


module.exports = verifyRecaptcha;