import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';
import sendEmail from '../utils/sendEmail.js';

// JWT Token Generator
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Register Student
export const register = async (req, res) => {
  const {
    fullName,
    email,
    password,
    studentId,
    department
  } = req.body;

  try {
    // Restrict registration to students only
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

     // const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10); FOR PRODUCTION


    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailTokenExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: 'student',
      studentId,
      department,
      emailToken,
      emailTokenExpires
    });

    await newUser.save();

    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${emailToken}`;
    await sendEmail(
      newUser.email,
      'Verify Your Email',
      `Click the following link to verify your email: ${verificationUrl}`
    );

    res.status(201).json({ message: 'Registration successful. Please check your email to verify.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({
      emailToken: token,
      emailTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.emailToken = undefined;
    user.emailTokenExpires = undefined;
    await user.save();

    const token = generateToken(user);


     res.status(200).json({ message: 'Email verified successfully', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create Lecturer (Admin only)
export const createLecturer = async (req, res) => {
  const { fullName, email, password, lecturerId, department, specialization } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create lecturers' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newLecturer = new User({
      fullName,
      email,
      password: hashedPassword,
      role: 'lecturer',
      lecturerId,
      department,
      specialization,
      isVerified: true // lecturers created by admin can be auto-verified
    });

    await newLecturer.save();

    res.status(201).json({ message: 'Lecturer created successfully', user: newLecturer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// 📌 Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email address exists.' });
    }

    // Generate raw + hashed token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token in DB
    user.resetToken = hashedResetToken;
    user.resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Create reset URL with raw token
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

    // Email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a></p>
        <p>This link will expire in 30 minutes.</p>
      </div>
    `;

    await sendEmail(user.email, 'Password Reset Request', htmlContent);

    res.status(200).json({
      message: 'If an account exists with that email, you will receive a reset link shortly.'
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error while processing password reset request' });
  }
};

// 📌 Reset Password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Hash incoming raw token from link
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching hashed token + not expired
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password + clear reset fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
};



// Send Email API Endpoint
export const sendEmailToUser = async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;

    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, htmlContent'
      });
    }

    await sendEmail(to, subject, htmlContent);

    res.status(200).json({
      success: true,
      message: 'Email queued for delivery'
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};
