import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;
  private readonly FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  private readonly APP_URL = process.env.APP_URL || 'http://localhost:3000';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not set. Email functionality will be disabled.');
    }
    this.resend = new Resend(apiKey || 'dummy-key');
  }

  /**
   * Send welcome email to new signup
   */
  async sendWelcomeEmail(
    email: string,
    waitlistName: string,
    position: number,
    referralLink: string
  ): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] Would send welcome email to:', email);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.FROM_EMAIL,
        to: email,
        subject: `You're on the ${waitlistName} waitlist!`,
        html: this.renderWelcomeTemplate({
          waitlistName,
          position,
          referralLink,
        }),
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw - email failure shouldn't block signup
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] Would send verification email to:', email);
      console.log('[Email] Verification link:', `${this.APP_URL}/verify-email?token=${token}`);
      return;
    }

    const verificationUrl = `${this.APP_URL}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.FROM_EMAIL,
        to: email,
        subject: 'Verify your email address',
        html: this.renderVerificationTemplate({ verificationUrl }),
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] Would send password reset email to:', email);
      console.log('[Email] Reset link:', `${this.APP_URL}/reset-password?token=${token}`);
      return;
    }

    const resetUrl = `${this.APP_URL}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.FROM_EMAIL,
        to: email,
        subject: 'Reset your password',
        html: this.renderPasswordResetTemplate({ resetUrl }),
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send bulk campaign email
   */
  async sendCampaignEmail(
    emails: string[],
    subject: string,
    htmlBody: string,
    unsubscribeUrl: string
  ): Promise<{ sent: number; failed: number }> {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] Would send campaign to', emails.length, 'recipients');
      return { sent: emails.length, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    // Send in batches of 100
    for (let i = 0; i < emails.length; i += 100) {
      const batch = emails.slice(i, i + 100);

      try {
        await Promise.all(
          batch.map(email =>
            this.resend.emails.send({
              from: this.FROM_EMAIL,
              to: email,
              subject,
              html: htmlBody + `<p style="margin-top: 40px; font-size: 12px; color: #666;"><a href="${unsubscribeUrl}">Unsubscribe</a></p>`,
              headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>`,
              },
            })
          )
        );
        sent += batch.length;
      } catch (error) {
        console.error('Failed to send batch:', error);
        failed += batch.length;
      }

      // Rate limiting: wait 1 second between batches
      if (i + 100 < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { sent, failed };
  }

  /**
   * Send single campaign email (simplified for MVP)
   */
  async sendSingleCampaignEmail(
    email: string,
    subject: string,
    message: string,
    waitlistName: string
  ): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] Would send campaign email to:', email);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.FROM_EMAIL,
        to: email,
        subject,
        html: this.renderCampaignTemplate({ message, waitlistName }),
      });
    } catch (error) {
      console.error('Failed to send campaign email:', error);
      throw error;
    }
  }

  private renderCampaignTemplate(data: { message: string; waitlistName: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">${data.waitlistName}</h2>
            <div style="white-space: pre-wrap;">${data.message}</div>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Sent from ${data.waitlistName} via WaitlistFast</p>
          </div>
        </body>
      </html>
    `;
  }

  private renderWelcomeTemplate(data: {
    waitlistName: string;
    position: number;
    referralLink: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're on the list!</h1>
          </div>
          
          <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Great news! You've successfully joined the <strong>${data.waitlistName}</strong> waitlist.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">Your position</p>
              <p style="margin: 10px 0 0 0; font-size: 48px; font-weight: bold; color: #667eea;">#${data.position}</p>
            </div>
            
            <p style="margin-bottom: 20px;">We'll notify you as soon as we launch. In the meantime, help us spread the word!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.referralLink}" style="display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Share with friends</a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">For every friend who joins using your link, you'll move up in the waitlist!</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>Powered by WaitlistFast</p>
          </div>
        </body>
      </html>
    `;
  }

  private renderVerificationTemplate(data: { verificationUrl: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h1 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Verify your email address</h1>
            
            <p style="margin-bottom: 20px;">Thanks for signing up! Please verify your email address to get started with WaitlistFast.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" style="display: inline-block; background: #18181b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px;">This link will expire in 24 hours.</p>
          </div>
        </body>
      </html>
    `;
  }

  private renderPasswordResetTemplate(data: { resetUrl: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h1 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Reset your password</h1>
            
            <p style="margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" style="display: inline-block; background: #18181b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px;">This link will expire in 1 hour.</p>
          </div>
        </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();
