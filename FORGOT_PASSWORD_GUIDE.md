# Forgot Password Implementation Guide

This guide explains how to use the forgot password functionality in the DLRS-BE application.

## Overview

The forgot password feature allows users to reset their passwords securely via email. The process involves:

1. User requests password reset via email
2. System sends reset link with secure token
3. User clicks link and sets new password
4. Password is updated and token is invalidated

## API Endpoints

### 1. Request Password Reset
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent. Please check your email for further instructions."
}
```

### 2. Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "new-secure-password"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## Environment Variables

Ensure these environment variables are set in your `.env` file:

```bash
# Required for password reset
CLIENT_URL=http://localhost:3000
RESEND_API_KEY=your-resend-api-key
JWT_SECRET=your-jwt-secret
```

## Frontend Integration

### Forgot Password Flow

1. **Forgot Password Page**
   - Create a form with email input
   - POST to `/api/auth/forgot-password`
   - Show success message regardless of email existence (security)

2. **Reset Password Page**
   - Extract token from URL query parameter
   - Create form with new password input
   - POST to `/api/auth/reset-password` with token and new password

### Example Frontend Code

#### Forgot Password Form
```javascript
const handleForgotPassword = async (email) => {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Password reset email sent! Check your inbox.');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Reset Password Form
```javascript
const handleResetPassword = async (token, password) => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Password reset successful! You can now log in.');
      // Redirect to login page
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Security Features

1. **Token Expiration**: Reset tokens expire after 30 minutes
2. **One-time Use**: Tokens are invalidated after use
3. **Secure Generation**: Uses crypto.randomBytes for token generation
4. **Rate Limiting**: Consider implementing rate limiting on endpoints
5. **HTTPS Only**: Ensure all requests use HTTPS in production

## Error Handling

The system handles various error scenarios:

- Invalid email addresses
- Expired reset tokens
- Already used tokens
- Weak passwords (minimum 6 characters)
- Server errors

## Testing the Flow

### Manual Testing Steps

1. **Register a test user** via `/api/auth/register`
2. **Verify email** using the verification link
3. **Request password reset** via `/api/auth/forgot-password`
4. **Check email** for reset link (check spam folder)
5. **Click reset link** and extract token
6. **Reset password** via `/api/auth/reset-password`
7. **Login** with new password via `/api/auth/login`

### Test Email Setup

For development, you can use:
- **Resend Test Mode**: Use test API keys
- **Email Testing Services**: Mailtrap, MailHog, or similar
- **Console Logging**: Temporarily log reset URLs to console

## Database Schema Changes

The User model has been updated with:

```javascript
resetToken: String, // Stores the password reset token
resetTokenExpires: Date, // Token expiration timestamp
```

## Troubleshooting

### Common Issues

1. **Email not received**
   - Check spam/junk folder
   - Verify RESEND_API_KEY is correct
   - Check email service configuration

2. **Token expired**
   - Tokens expire after 30 minutes
   - Request a new reset link

3. **Invalid token**
   - Ensure token is copied correctly from URL
   - Check for URL encoding issues

4. **Password too weak**
   - Ensure password meets minimum requirements (6+ characters)

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will log email sending attempts and token generation.

## Production Considerations

1. **Rate Limiting**: Implement rate limiting on forgot password endpoint
2. **Email Templates**: Customize email templates for your brand
3. **Monitoring**: Set up alerts for email delivery failures
4. **Security Headers**: Implement proper security headers
5. **HTTPS**: Ensure all endpoints use HTTPS
6. **Token Storage**: Consider using Redis for token storage in high-traffic scenarios
