import express from 'express';
import {
  register,
  login,
  createLecturer,
  sendEmailToUser,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';
import {
  validateRegister,
  validateLogin,
  validateCreateLecturer,
  validateForgotPassword,
  validateResetPassword
} from '../middlewares/validate.middleware.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - studentId
 *               - department
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the student
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password
 *               studentId:
 *                 type: string
 *                 description: Student ID
 *               department:
 *                 type: string
 *                 description: Department name
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: User already exists or validation error
 *       500:
 *         description: Server error
 */
router.post('/register', validateRegister, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/auth/create-lecturer:
 *   post:
 *     summary: Create a new lecturer (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - lecturerId
 *               - department
 *               - specialization
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               lecturerId:
 *                 type: string
 *               department:
 *                 type: string
 *               specialization:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lecturer created successfully
 *       403:
 *         description: Only admins can create lecturers
 *       400:
 *         description: Email already in use or validation error
 *       500:
 *         description: Server error
 */
router.post('/create-lecturer', protect, restrictTo('admin'), validateCreateLecturer, createLecturer);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify email address
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  const user = await import('../models/user.model.js').then(m => m.default.findOne({
    emailToken: token,
    emailTokenExpires: { $gt: Date.now() }
  }));

  if (!user) return res.status(400).json({ message: 'Token invalid or expired' });

  user.isVerified = true;
  user.emailToken = undefined;
  user.emailTokenExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully' });
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: No account with that email
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', validateForgotPassword, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/reset-password', validateResetPassword, resetPassword);

/**
 * @swagger
 * /api/auth/send-email:
 *   post:
 *     summary: Send email (utility endpoint)
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - htmlContent
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               htmlContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email queued for delivery
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to send email
 */
router.post('/send-email', sendEmailToUser);

export default router;
