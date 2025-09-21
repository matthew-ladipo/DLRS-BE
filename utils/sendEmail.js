import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config(); // load env vars

// Debug: Check if API key is available
console.log('🔍 RESEND_API_KEY available:', !!process.env.RESEND_API_KEY);
console.log('🔍 RESEND_API_KEY value:', process.env.RESEND_API_KEY ? '***' : 'NOT SET');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const response = await resend.emails.send({
      from: 'DLRS No-Reply <onboarding@resend.dev>',
      to,
      subject,
      html: htmlContent
    });
    
    if (response.error) {
      console.error(`❌ Resend API Error: ${response.error.message}`);
      console.error('🔍 Error details:', {
        code: response.error.statusCode,
        type: response.error.name
      });
      throw new Error(`Resend API Error: ${response.error.message}`);
    }

    console.log(`✅ Email sent successfully to ${to}`);
    console.log('🔍 Resend Email ID:', response.data.id);
    console.log('🔍 View email in Resend Dashboard: https://resend.com/emails/' + response.data.id);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      cause: error.cause
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;
