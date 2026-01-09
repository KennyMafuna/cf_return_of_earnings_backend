const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendRegistrationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const sendSms = require('../service/vodacomService');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const generateRandomPassword = () => {
  return crypto.randomBytes(3).toString('hex');
};

const checkUserInfo = async (req, res) => {
    try {
        const { idNumber, name, surname } = req.body;

        if (!idNumber || !name || !surname) {
        return res.status(400).json({
            success: false,
            message: 'ID Number, Name, and Surname are required'
        });
        }

        const idRegex = /^[0-9]{13}$/;
        if (!idRegex.test(idNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID number format. Must be exactly 13 digits.'
        });
        }

        const existingUser = await User.findOne({ idNumber });
        if (existingUser) {
        return res.status(409).json({
            success: false,
            message: 'User with this ID number already exists'
        });
        }

        res.status(200).json({
        success: true,
        message: 'User information is valid',
        data: { idNumber, name, surname, isValid: true }
        });

    } catch (error) {
        console.error('Check user info error:', error);
        res.status(500).json({
        success: false,
        message: 'Error checking user information'
        });
    }
};

const checkUserExists = async (req, res) => {
    try {
        const { idNumber, name, surname } = req.body;

        if (!idNumber || !name || !surname) {
            return res.status(400).json({
                success: false,
                message: 'ID Number, Name, and Surname are required'
            });
        }

        const idRegex = /^[0-9]{13}$/;
        if (!idRegex.test(idNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID number format. Must be exactly 13 digits.'
            });
        }

        // Find user by ID number and verify personal details
        const existingUser = await User.findOne({ 
            idNumber,
            name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case insensitive match
            surname: { $regex: new RegExp(`^${surname}$`, 'i') }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'No user found with the provided information. Please check your details and try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User verified successfully',
            data: { 
                idNumber, 
                name, 
                surname, 
                isValid: true,
                email: existingUser.email // You might want to mask this or just return a confirmation
            }
        });

    } catch (error) {
        console.error('Check user exists error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying user information'
        });
    }
};

const register = async (req, res) => {
    try {
        console.log('🔐 Registration request received - NO reCAPTCHA expected');
        console.log('📦 Request body:', req.body);

        const {
        idNumber,
        name,
        surname,
        email,
        phoneNumber,
        telephoneNumber
        } = req.body;

        // Validate required fields
        if (!idNumber || !name || !surname || !email || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'ID Number, Name, Surname, Email, and Mobile Number are required'
            });
        }

        console.log('✅ All required fields present');

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { idNumber }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or ID number already exists'
            });
        }

        // Generate random password
        const generatedPassword = generateRandomPassword();
        console.log('🔑 Generated password:', generatedPassword);

        // Create new user
        const user = new User({
            idNumber,
            name,
            surname,
            email,
            phoneNumber,
            telephoneNumber: telephoneNumber || '',
            password: generatedPassword
        });

        await user.save();
        console.log('✅ User saved successfully');

        // ✅ SEND EMAIL WITH CREDENTIALS
        try {
          await sendRegistrationEmail(email, idNumber, generatedPassword);
          console.log('✅ Registration email sent successfully');
        } catch (emailError) {
          console.error('❌ Email sending failed:', emailError);
          // Don't fail the registration if email fails, just log it
        }

        const token = generateToken(user._id);

        res.status(201).json({
        success: true,
        message: 'User registered successfully! Check your email for login credentials.',
        data: {
            user: {
            id: user._id,
            idNumber: user.idNumber,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phoneNumber: user.phoneNumber
            },
            token
        }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        
        if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors
        });
        }

        res.status(500).json({
        success: false,
        message: 'Error during registration'
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const bcrypt = require('bcryptjs');
        const mongoose = require('mongoose');

        console.log('Login attempt with username:', username);

        // Try to find user by idNumber first (regular users)
        let user = await User.findOne({ idNumber: username });
        
        // If not found, try to find in admin_users collection by username or email
        if (!user) {
            console.log('Not found in users collection, checking admin_users...');
            const adminUsersCollection = mongoose.connection.collection('admin_users');
            const adminUser = await adminUsersCollection.findOne({ 
                $or: [{ username }, { email: username }] 
            });
            
            if (adminUser) {
                console.log('Found admin user:', adminUser.username);
                const isPasswordValid = await bcrypt.compare(password, adminUser.password);
                
                console.log('Password valid for admin:', isPasswordValid);
                if (!isPasswordValid) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid username or password'
                    });
                }
                
                // Update last login for admin user
                await adminUsersCollection.updateOne(
                    { _id: adminUser._id },
                    { $set: { lastLogin: new Date(), updatedAt: new Date() } }
                );
                
                const token = generateToken(adminUser._id);
                
                // Convert permissions object to array format for frontend
                let permissionsArray = [];
                if (adminUser.permissions && typeof adminUser.permissions === 'object') {
                    // Flatten permissions object into array
                    Object.keys(adminUser.permissions).forEach(resource => {
                        const actions = adminUser.permissions[resource];
                        if (typeof actions === 'object') {
                            Object.keys(actions).forEach(action => {
                                if (actions[action] === true) {
                                    permissionsArray.push(`${resource}_${action}`);
                                }
                            });
                        }
                    });
                }
                
                // For super_admin, give all permissions
                if (adminUser.role === 'super_admin' || adminUser.role === 'admin') {
                    permissionsArray = ['read', 'write', 'delete', 'manage_documents', 'manage_users', 'system_admin', 'process_roe_submissions', 'approve_audits', 'manage_organizations'];
                }
                
                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: {
                            id: adminUser._id,
                            username: adminUser.username,
                            email: adminUser.email,
                            fullName: adminUser.fullName,
                            role: adminUser.role,
                            permissions: permissionsArray,
                            lastLogin: new Date()
                        },
                        token
                    }
                });
            }
        }
        
        console.log('Found user:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('No user found with idNumber:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        console.log('User found:', user.idNumber);
        const isPasswordValid = await user.comparePassword(password);
        
        console.log('Password valid:', isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        await user.updateLastLogin();
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                id: user._id,
                idNumber: user.idNumber,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                lastLogin: user.lastLogin,
                isVerified: user.isVerified
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { idNumber, name, surname } = req.body;

        if (!idNumber || !name || !surname) {
            return res.status(400).json({
                success: false,
                message: 'ID Number, Name, and Surname are required'
            });
        }

        // Find user by ID number and verify personal details
        const user = await User.findOne({ 
            idNumber,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            surname: { $regex: new RegExp(`^${surname}$`, 'i') }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with the provided information'
            });
        }

        // Generate new random password
        const newPassword = generateRandomPassword();
        
        // Update user's password
        user.password = newPassword;
        user.isVerified = true;
        await user.save();

        // Send password reset email - use the new template
        try {
            await sendPasswordResetEmail(user.email, idNumber, newPassword);
            console.log('✅ Password reset email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            // Don't fail the reset if email fails
        }

        res.status(200).json({
            success: true,
            message: `Password reset successfully! Check your email (${user.email}) for the new password.`,
            data: {
                email: user.email
            }
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body; // Only one password

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email and new password are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user's password
        user.password = newPassword;
        user.isVerified = true; // Mark as verified after password change
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
};

module.exports = {
  checkUserInfo,
  register,
  login,
  resetPassword,
  forgotPassword,
  checkUserExists
};
