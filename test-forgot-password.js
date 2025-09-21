// Simple test script for forgot password functionality
// Run with: node test-forgot-password.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

async function testForgotPassword() {
  console.log('🧪 Testing Forgot Password Flow...\n');

  // Test 1: Request password reset
  console.log('1. Testing forgot password request...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.EMAIL_RECEIVER })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Forgot password request successful');
    } else {
      console.log('❌ Forgot password request failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n2. Testing reset password...');
  // Note: You'll need to manually get a valid token from email
  console.log('ℹ️  To test reset password, you need:');
  console.log('   - A valid reset token from email');
  console.log('   - Use the token in the reset password request');
  console.log('\nExample:');
  console.log(`curl -X POST ${BASE_URL}/api/auth/reset-password \\
  -H "Content-Type: application/json" \\
  -d '{"token":"YOUR_TOKEN_HERE","password":"newpassword123"}'`);
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testForgotPassword();
}

export default testForgotPassword;
