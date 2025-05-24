const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (this.isProduction) {
      // Initialize SendGrid
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    } else {
      // Initialize Nodemailer for development
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.FROM_EMAIL,
          pass: process.env.FROM_EMAIL_PASSWORD
        }
      });
    }
  }

  async sendEmail({ to, subject, text, html }) {
    try {
      if (this.isProduction) {
        // Use SendGrid in production
        const msg = {
          to,
          from: process.env.FROM_EMAIL,
          subject,
          text,
          html
        };
        
        await sgMail.send(msg);
        logger.info('Email sent successfully via SendGrid');
      } else {
        // Use Nodemailer in development
        const mailOptions = {
          from: process.env.FROM_EMAIL,
          to,
          subject,
          text,
          html
        };

        await this.transporter.sendMail(mailOptions);
        logger.info('Email sent successfully via Nodemailer');
      }
      
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendOTPEmail(email, otp) {
    const subject = 'Your OTP for BuildXup';
    const text = `Your OTP is: ${otp}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your OTP for BuildXup</h2>
        <p style="font-size: 16px; color: #666;">Please use the following OTP to verify your account:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; margin: 0; font-size: 32px;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #999;">This OTP will expire in 5 minutes.</p>
        <p style="font-size: 14px; color: #999;">If you didn't request this OTP, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }
}

module.exports = new EmailService(); 