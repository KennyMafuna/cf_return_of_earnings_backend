const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // TLS via STARTTLS
    auth: {
      user: process.env.BREVO_SMTP_USER,     // 9f5007001@smtp-brevo.com
      pass: process.env.BREVO_SMTP_PASSWORD, // p5EXQ7JAPtbOjr9D
    },
    connectionTimeout: 60_000,
    socketTimeout: 60_000,
  });
};


const sendRegistrationEmail = async (email, idNumber, password) => {
    try {
        console.log('📧 Attempting to send email to:', email);
        console.log('🔐 Using email user:', process.env.EMAIL_USER);
        
        // Validate environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('Email credentials not configured in environment variables');
        }

        const transporter = createTransporter();

        // Verify transporter configuration
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');

        const mailOptions = {
            from: {
                name: 'ROE Online', // Add sender name for better deliverability
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Your ROE Online Account Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden;">
                
                    <!-- Header -->
                    <div style="background-color: #027E40; padding: 20px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">Welcome to ROE Online</h1>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 20px; color: #000000; text-align: center;">
                        <p style="font-size: 16px; color: #565656;">
                        Your account has been successfully created. Here are your login credentials:
                        </p>
                        
                        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb; text-align: left;">
                            <p style="margin: 0; font-size: 16px;"><strong>Username:</strong> ${idNumber}</p>
                            <p style="margin: 0; font-size: 16px;"><strong>Password:</strong> ${password}</p>
                        </div>
                        
                        <p style="color: #FF1B1B; font-weight: bold; margin: 12px 0;">
                        Please keep this information secure and change your password after first login.
                        </p>
                        
                        <a href="https://qa.d23bpaa1sw551r.amplifyapp.com/" 
                        style="display: inline-block; background-color: #FCAA1A; color: white; padding: 12px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; margin-top: 16px;">
                        Login to Your Account
                        </a>
                        
                        <p style="margin-top: 24px; font-size: 14px; color: #565656;">
                        Best regards,<br><strong style="color: #027E40;">ROE Online Team</strong>
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Registration email sent successfully');
        console.log('📨 Message ID:', result.messageId);
        console.log('✅ Response:', result.response);
        return result;
    } catch (error) {
        console.error('❌ Email sending error details:');
        console.error('   - Error name:', error.name);
        console.error('   - Error message:', error.message);
        console.error('   - Error code:', error.code);
        
        // Provide specific guidance based on error type
        if (error.code === 'EAUTH') {
            throw new Error('Authentication failed. Please check: 1) 2-Factor Authentication is enabled, 2) You are using an App Password (not your regular password), 3) The App Password has no spaces');
        } else if (error.code === 'ECONNECTION') {
            throw new Error('Connection failed. Please check your internet connection.');
        } else {
            throw new Error('Failed to send registration email: ' + error.message);
        }
    }
};

const sendPasswordResetEmail = async (email, idNumber, newPassword) => {
    try {
        console.log('📧 Attempting to send password reset email to:', email);
        console.log('🔐 Using email user:', process.env.EMAIL_USER);
        
        // Validate environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('Email credentials not configured in environment variables');
        }

        const transporter = createTransporter();

        // Verify transporter configuration
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');

        const mailOptions = {
            from: {
                name: 'ROE Online',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'ROE Online - Password Reset Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden;">
                
                    <!-- Header -->
                    <div style="background-color: #027E40; padding: 20px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">Password Reset Complete</h1>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 20px; color: #000000; text-align: center;">
                        <p style="font-size: 16px; color: #565656;">
                        Your password has been successfully reset. Here are your new login credentials:
                        </p>
                        
                        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb; text-align: left;">
                            <p style="margin: 0; font-size: 16px;"><strong>Username:</strong> ${idNumber}</p>
                            <p style="margin: 0; font-size: 16px;"><strong>New Password:</strong> ${newPassword}</p>
                        </div>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 12px; margin: 16px 0; text-align: left;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                <strong>⚠️ Security Notice:</strong> For security reasons, please log in and change your password immediately after first login.
                            </p>
                        </div>
                        
                        <a href="https://qa.d23bpaa1sw551r.amplifyapp.com/" 
                        style="display: inline-block; background-color: #FCAA1A; color: white; padding: 12px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; margin-top: 16px;">
                        Login with New Password
                        </a>
                        
                        <div style="margin-top: 20px; padding: 12px; background-color: #f8f9fa; border-radius: 6px; text-align: left;">
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                <strong>Didn't request this change?</strong> If you did not request a password reset, please contact our support team immediately and change your password.
                            </p>
                        </div>
                        
                        <p style="margin-top: 24px; font-size: 14px; color: #565656;">
                        Best regards,<br><strong style="color: #027E40;">ROE Online Security Team</strong>
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent successfully');
        console.log('📨 Message ID:', result.messageId);
        console.log('✅ Response:', result.response);
        return result;
    } catch (error) {
        console.error('❌ Password reset email sending error details:');
        console.error('   - Error name:', error.name);
        console.error('   - Error message:', error.message);
        console.error('   - Error code:', error.code);
        
        // Provide specific guidance based on error type
        if (error.code === 'EAUTH') {
            throw new Error('Authentication failed. Please check: 1) 2-Factor Authentication is enabled, 2) You are using an App Password (not your regular password), 3) The App Password has no spaces');
        } else if (error.code === 'ECONNECTION') {
            throw new Error('Connection failed. Please check your internet connection.');
        } else {
            throw new Error('Failed to send password reset email: ' + error.message);
        }
    }
};

const sendApprovalEmail = async (userEmail, organisationData) => {
    try {
        console.log('📧 Attempting to send approval email to:', userEmail);
        console.log('🏢 Organisation data:', organisationData);
        
        // Validate environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('Email credentials not configured in environment variables');
        }

        const transporter = createTransporter();

        // Verify transporter configuration
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');

        const mailOptions = {
            from: {
                name: 'ROE Online',
                address: process.env.EMAIL_USER
            },
            to: userEmail,
            subject: '🎉 Your Organisation Has Been Approved!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden;">
                
                    <!-- Header -->
                    <div style="background-color: #027E40; padding: 20px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">Organisation Approved! 🎉</h1>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 20px; color: #000000;">
                        <p style="font-size: 16px; color: #565656; text-align: center;">
                        Congratulations! Your organisation registration has been approved.
                        </p>
                        
                        <!-- Organisation Details -->
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                            <h3 style="color: #027E40; margin-top: 0; text-align: center;">Organisation Details</h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
                                <div>
                                    <strong>Trading Name:</strong>
                                    <p style="margin: 4px 0; color: #565656;">${organisationData.tradingName || 'N/A'}</p>
                                </div>
                                <div>
                                    <strong>Registration Number:</strong>
                                    <p style="margin: 4px 0; color: #565656;">${organisationData.registrationNumber}</p>
                                </div>
                                <div>
                                    <strong>Organisation Type:</strong>
                                    <p style="margin: 4px 0; color: #565656;">${organisationData.organisationType}</p>
                                </div>
                                <div>
                                    <strong>Tax Number:</strong>
                                    <p style="margin: 4px 0; color: #565656;">${organisationData.taxNumber}</p>
                                </div>
                            </div>
                            
                            <!-- CF Registration Number - Highlighted -->
                            <div style="background-color: #d4edda; border: 2px solid #c3e6cb; border-radius: 6px; padding: 16px; margin-top: 16px; text-align: center;">
                                <h4 style="color: #155724; margin: 0 0 8px 0;">Your CF Registration Number</h4>
                                <div style="font-size: 24px; font-weight: bold; color: #155724; letter-spacing: 2px;">
                                    ${organisationData.cfRegistrationNumber || 'Pending Assignment'}
                                </div>
                                <p style="color: #155724; margin: 8px 0 0 0; font-size: 14px;">
                                    Use this number for all future correspondence and submissions
                                </p>
                            </div>
                            <div style="background-color: #d4edda; border: 2px solid #c3e6cb; border-radius: 6px; padding: 16px; margin-top: 16px; text-align: center;">
                                <h4 style="color: #155724; margin: 0 0 8px 0;">Your BP Number</h4>
                                <div style="font-size: 24px; font-weight: bold; color: #155724; letter-spacing: 2px;">
                                    ${organisationData.bpNumber || 'Pending Assignment'}
                                </div>
                                <p style="color: #155724; margin: 8px 0 0 0; font-size: 14px;">
                                    Use this number for all future correspondence
                                </p>
                            </div>
                        </div>

                        <!-- Next Steps -->
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 16px; margin: 16px 0;">
                            <h4 style="color: #856404; margin: 0 0 8px 0;">📋 Next Steps</h4>
                            <ul style="color: #856404; margin: 0; padding-left: 20px;">
                                <li>Keep your CF Registration Number secure</li>
                                <li>Use this number for all ROE submissions</li>
                                <li>Login to your account to manage your organisation</li>
                                <li>Contact support if you need assistance</li>
                            </ul>
                        </div>

                        <!-- Action Button -->
                        <div style="text-align: center; margin: 24px 0;">
                            <a href="https://qa.d23bpaa1sw551r.amplifyapp.com//dashboard" 
                            style="display: inline-block; background-color: #FCAA1A; color: white; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 16px;">
                            Go to Dashboard
                            </a>
                        </div>
                        
                        <!-- Contact Info -->
                        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                            <p style="font-size: 14px; color: #565656; margin: 0;">
                                Need help? Contact our support team at 
                                <a href="mailto:support@roeonline.co.za" style="color: #027E40;">support@roeonline.co.za</a>
                            </p>
                            <p style="font-size: 14px; color: #565656; margin: 8px 0 0 0;">
                                Best regards,<br><strong style="color: #027E40;">ROE Online Team</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Approval email sent successfully');
        console.log('📨 Message ID:', result.messageId);
        return result;
    } catch (error) {
        console.error('❌ Approval email sending error:');
        console.error('   - Error name:', error.name);
        console.error('   - Error message:', error.message);
        console.error('   - Error code:', error.code);
        
        if (error.code === 'EAUTH') {
            throw new Error('Email authentication failed. Please check your email configuration.');
        } else {
            throw new Error('Failed to send approval email: ' + error.message);
        }
    }
};

const sendLinkingEmail = async (organisation, user, docxBuffer) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: {
                name: 'ROE Online',
                address: process.env.EMAIL_USER
            },
            to: [user.email, organisation.organisationDetails?.contact?.email, organisation.organisationDetails?.contact?.email].filter(Boolean),
            subject: `Organisation Linking Request - ${organisation.organisationDetails?.tradingName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #027E40; padding: 20px; text-align: center; color: white;">
                        <h1>Organisation Linking Request</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${organisation.organisationDetails?.contact?.person || 'Organisation Representative'},</p>
                        
                        <p><strong>${user.name} ${user.surname}</strong> has requested to link to your organisation:</p>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <h3>Organisation Details:</h3>
                            <p><strong>CF Number:</strong> ${organisation.cfRegistrationNumber}</p>
                            <p><strong>Trading Name:</strong> ${organisation.organisationDetails?.tradingName}</p>
                            <p><strong>Registration Number:</strong> ${organisation.registrationNumber}</p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <h3>Requesting User:</h3>
                            <p><strong>Name:</strong> ${user.name} ${user.surname}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Phone:</strong> ${user.phoneNumber}</p>
                        </div>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Download and open the attached linking form (Word document)</li>
                            <li>Print the form</li>
                            <li>Complete the declaration section</li>
                            <li>Sign the form</li>
                            <li>Upload the signed form through the ROE Online portal</li>
                        </ol>
                        
                        <p><em>Note: The attached form is in Microsoft Word format for easy editing and printing.</em></p>
                        
                        <p>Best regards,<br><strong>ROE Online Team</strong></p>
                    </div>
                </div>
            `,
            attachments: [{
                filename: `Linking_Form_${organisation.cfRegistrationNumber}.docx`,
                content: docxBuffer,
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }]
        };

        await transporter.sendMail(mailOptions);
        console.log('Linking email sent successfully with DOCX attachment');
    } catch (error) {
        console.error('Linking email error:', error);
        throw error;
    }
};

const sendLinkingConfirmationEmail = async (organisation, user) => {
    try {
        console.log('📧 Sending linking confirmation email...');
        
        // Validate environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('Email credentials not configured in environment variables');
        }

        const transporter = createTransporter();

        // Verify transporter configuration
        await transporter.verify();
        console.log('✅ SMTP connection verified for confirmation email');

        const mailOptions = {
            from: {
                name: 'ROE Online',
                address: process.env.EMAIL_USER
            },
            to: [user.email, organisation.userId.email, organisation.organisationDetails.contact.email].filter(Boolean),
            subject: `Organisation Linking Confirmed - ${organisation.organisationDetails?.tradingName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #027E40; padding: 20px; text-align: center; color: white;">
                        <h1>Organisation Linking Confirmed ✅</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${user.name} ${user.surname},</p>
                        
                        <p>We are pleased to inform you that your linking request has been <strong>approved</strong>!</p>
                        
                        <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <h3 style="color: #155724; margin-top: 0;">Linking Details:</h3>
                            <p><strong>Organisation:</strong> ${organisation.organisationDetails?.tradingName}</p>
                            <p><strong>CF Number:</strong> ${organisation.cfRegistrationNumber}</p>
                            <p><strong>Registration Number:</strong> ${organisation.registrationNumber}</p>
                            <p><strong>Status:</strong> <span style="color: #155724; font-weight: bold;">Approved</span></p>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <h4 style="color: #856404; margin-top: 0;">What You Can Do Now:</h4>
                            <ul style="color: #856404;">
                                <li>Submit Return of Earnings (ROE) for this organisation</li>
                                <li>View organisation details and documents</li>
                                <li>Manage multiple organisations from your dashboard</li>
                                <li>Access historical submissions</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://qa.d23bpaa1sw551r.amplifyapp.com//dashboard" 
                               style="display: inline-block; background-color: #FCAA1A; color: white; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 16px;">
                                Go to Dashboard
                            </a>
                        </div>
                        
                        <p>If you have any questions, please contact our support team.</p>
                        
                        <p>Best regards,<br><strong>ROE Online Team</strong></p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Linking confirmation email sent successfully');
        console.log('📨 Message ID:', result.messageId);
        return result;
    } catch (error) {
        console.error('❌ Linking confirmation email error:');
        console.error('   - Error:', error.message);
        
        if (error.code === 'EAUTH') {
            throw new Error('Email authentication failed');
        } else {
            throw new Error('Failed to send linking confirmation email: ' + error.message);
        }
    }
};


module.exports = {
  sendRegistrationEmail,
  sendApprovalEmail,
  sendLinkingConfirmationEmail,
  sendLinkingEmail,
  sendPasswordResetEmail,
};