import express from 'express';
import { 
  register, 
  login, 
  sendEmailToUser, 
  forgotPassword, 
  resetPassword 
} from '../controllers/auth.controller.js';
import { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword, 
  validateResetPassword 
} from '../middlewares/validate.middleware.js';

const router = express.Router();

// Authentication routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Email verification
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

// Password reset routes
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// Email sending endpoint
router.post('/send-email', sendEmailToUser);

export default router;
