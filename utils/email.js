const sgMail = require('@sendgrid/mail');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@buildxup.com';
    this.fromName = process.env.FROM_NAME || 'BuildXUp Team';
    this.initialized = false;
  }

  initializeSendGrid() {
    if (this.initialized) {
      return true;
    }

    if (!process.env.SENDGRID_API_KEY) {
      logger.warn('SENDGRID_API_KEY is not configured. Email service will be disabled.');
      return false;
    }

    // Validate API key format - trim whitespace and check if it starts with SG.
    const apiKey = process.env.SENDGRID_API_KEY.trim();
    logger.info(`SendGrid API key found: ${apiKey.substring(0, 10)}...`);
    
    if (!apiKey.startsWith('SG.')) {
      logger.warn(`Invalid SendGrid API key format. Key starts with: "${apiKey.substring(0, 5)}..." Must start with "SG."`);
      return false;
    }

    try {
      sgMail.setApiKey(apiKey);
      this.initialized = true;
      logger.info('SendGrid email service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize SendGrid:', error);
      return false;
    }
  }

  async sendEmail({ to, subject, text, html, from = null, templateId = null }) {
    // Initialize SendGrid if not already done
    if (!this.initializeSendGrid()) {
      logger.warn('Email service not available. Email would be sent to:', to);
      return {
        success: true,
        message: 'Email sent successfully (simulated)',
        simulated: true
      };
    }

    try {
      const fromAddress = from || this.fromEmail;
      
        const msg = {
          to,
        from: {
          email: fromAddress,
          name: this.fromName
        },
          subject,
          text,
        html,
        // Add headers to improve deliverability
        headers: {
          'List-Unsubscribe': `<mailto:${this.fromEmail}?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'Precedence': 'bulk',
          'X-Mailer': 'BuildXUp/1.0'
        },
        // Add tracking settings
        trackingSettings: {
          clickTracking: {
            enable: false,
            enableText: false
          },
          openTracking: {
            enable: false
          },
          subscriptionTracking: {
            enable: false
          }
        },
        // Add spam prevention settings (only supported properties)
        mailSettings: {
          bypassListManagement: {
            enable: false
          },
          footer: {
            enable: false
          },
          sandboxMode: {
            enable: false
          }
        }
      };

      // Use template if provided
      if (templateId) {
        msg.templateId = templateId;
        delete msg.html;
        delete msg.text;
      }
      
      const response = await sgMail.send(msg);
      logger.info(`Email sent successfully via SendGrid to ${to}`, {
        messageId: response[0]?.headers['x-message-id'],
        statusCode: response[0]?.statusCode
      });
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      
      // Handle SendGrid specific errors
      if (error.response) {
        const { message, code, response } = error.response.body.errors[0];
        logger.error('SendGrid error:', { message, code, response });
      }
      
      throw error;
    }
  }

  async sendOTPEmail(email, otp) {
    const subject = 'Your BuildXUp Verification Code';
    const text = `Your BuildXUp verification code is: ${otp}. This code will expire in 10 minutes. If you didn't request this code, please ignore this email.`;
    const html = this.generateOTPEmailTemplate(otp);

    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  async sendWelcomeEmail(email, firstName) {
    const subject = 'Welcome to BuildXUp!';
    const text = `Welcome ${firstName}! Thank you for joining BuildXUp. We're excited to help you manage your projects more efficiently.`;
    const html = this.generateWelcomeEmailTemplate(firstName);

    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your BuildXUp Password';
    const text = `You requested to reset your BuildXUp password. Click this link to create a new password: ${resetUrl}. This link will expire in 1 hour.`;
    const html = this.generatePasswordResetTemplate(resetUrl);

    return this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  generateOTPEmailTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Your BuildXUp Verification Code</title>
        <style>
          /* Reset styles */
          body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
          
          /* Base styles */
          body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f4f4f4 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
            color: #333333 !important;
          }
          
          .email-container {
            max-width: 600px !important;
            margin: 0 auto !important;
            background-color: #ffffff !important;
          }
          
          .header {
            background-color: #007bff !important;
            padding: 30px 20px !important;
            text-align: center !important;
          }
          
          .header h1 {
            color: #ffffff !important;
            margin: 0 !important;
            font-size: 28px !important;
            font-weight: 600 !important;
          }
          
          .content {
            padding: 40px 30px !important;
          }
          
          .otp-container {
            background-color: #f8f9fa !important;
            border: 2px solid #e9ecef !important;
            border-radius: 12px !important;
            padding: 30px !important;
            text-align: center !important;
            margin: 30px 0 !important;
          }
          
          .otp-code {
            background-color: #007bff !important;
            color: #ffffff !important;
            padding: 20px !important;
            border-radius: 8px !important;
            font-size: 32px !important;
            font-weight: bold !important;
            letter-spacing: 8px !important;
            margin: 20px 0 !important;
            display: inline-block !important;
            min-width: 200px !important;
          }
          
          .footer {
            background-color: #f8f9fa !important;
            padding: 20px 30px !important;
            text-align: center !important;
            border-top: 1px solid #e9ecef !important;
          }
          
          .footer p {
            color: #6c757d !important;
            font-size: 14px !important;
            margin: 5px 0 !important;
          }
          
          .warning {
            background-color: #fff3cd !important;
            border: 1px solid #ffeaa7 !important;
            border-radius: 6px !important;
            padding: 15px !important;
            margin: 20px 0 !important;
            color: #856404 !important;
            font-size: 14px !important;
          }
          
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
            }
            .content {
              padding: 20px 15px !important;
            }
            .otp-code {
              font-size: 24px !important;
              letter-spacing: 4px !important;
              min-width: 150px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>BuildXUp</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Your Verification Code</h2>
            
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Please use the following verification code to complete your account setup:
            </p>
            
            <div class="otp-container">
              <div class="otp-code">${otp}</div>
              <p style="color: #666; font-size: 16px; margin: 20px 0 0 0;">
                This code will expire in <strong>10 minutes</strong>
              </p>
            </div>
            
            <div class="warning">
              <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email and do not share this code with anyone.
            </div>
            
            <p style="color: #666; font-size: 16px; margin-top: 30px;">
              Thank you for choosing BuildXUp!
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 BuildXUp. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
            <p>If you have questions, contact us at support@buildxup.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeEmailTemplate(firstName) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Welcome to BuildXUp</title>
        <style>
          body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f4f4f4 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
            color: #333333 !important;
          }
          
          .email-container {
            max-width: 600px !important;
            margin: 0 auto !important;
            background-color: #ffffff !important;
          }
          
          .header {
            background-color: #007bff !important;
            padding: 30px 20px !important;
            text-align: center !important;
          }
          
          .header h1 {
            color: #ffffff !important;
            margin: 0 !important;
            font-size: 28px !important;
            font-weight: 600 !important;
          }
          
          .content {
            padding: 40px 30px !important;
          }
          
          .cta-button {
            background-color: #007bff !important;
            color: #ffffff !important;
            padding: 15px 30px !important;
            text-decoration: none !important;
            border-radius: 6px !important;
            display: inline-block !important;
            font-weight: 600 !important;
            margin: 20px 0 !important;
          }
          
          .footer {
            background-color: #f8f9fa !important;
            padding: 20px 30px !important;
            text-align: center !important;
            border-top: 1px solid #e9ecef !important;
          }
          
          .footer p {
            color: #6c757d !important;
            font-size: 14px !important;
            margin: 5px 0 !important;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>BuildXUp</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Welcome to BuildXUp, ${firstName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining BuildXUp! We're excited to have you on board and help you manage your projects more efficiently.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 20px;">What you can do with BuildXUp:</h3>
              <ul style="color: #666; line-height: 1.8; font-size: 16px;">
                <li>Create and manage projects</li>
                <li>Track tasks and progress</li>
                <li>Collaborate with team members</li>
                <li>Monitor project analytics</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
                Get Started
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2024 BuildXUp. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
            <p>If you have questions, contact us at support@buildxup.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Reset Your BuildXUp Password</title>
        <style>
          body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f4f4f4 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
            color: #333333 !important;
          }
          
          .email-container {
            max-width: 600px !important;
            margin: 0 auto !important;
            background-color: #ffffff !important;
          }
          
          .header {
            background-color: #dc3545 !important;
            padding: 30px 20px !important;
            text-align: center !important;
          }
          
          .header h1 {
            color: #ffffff !important;
            margin: 0 !important;
            font-size: 28px !important;
            font-weight: 600 !important;
          }
          
          .content {
            padding: 40px 30px !important;
          }
          
          .cta-button {
            background-color: #dc3545 !important;
            color: #ffffff !important;
            padding: 15px 30px !important;
            text-decoration: none !important;
            border-radius: 6px !important;
            display: inline-block !important;
            font-weight: 600 !important;
            margin: 20px 0 !important;
          }
          
          .footer {
            background-color: #f8f9fa !important;
            padding: 20px 30px !important;
            text-align: center !important;
            border-top: 1px solid #e9ecef !important;
          }
          
          .footer p {
            color: #6c757d !important;
            font-size: 14px !important;
            margin: 5px 0 !important;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>BuildXUp</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Reset Your Password</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              You requested to reset your BuildXUp password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="cta-button">
                Reset Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 BuildXUp. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
            <p>If you have questions, contact us at support@buildxup.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email service
  async testEmailService() {
    try {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      await this.sendEmail({
        to: testEmail,
        subject: 'Test Email from BuildXUp',
        text: 'This is a test email to verify the email service is working.',
        html: '<h1>Test Email</h1><p>This is a test email to verify the email service is working.</p>'
      });
      logger.info('Email service test successful');
      return true;
    } catch (error) {
      logger.error('Email service test failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService(); 