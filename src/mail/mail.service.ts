import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  baseUrl = 'https://dreamy-medovik-fc3c38.netlify.app/';

  async sendWelcomeEmail(to: string, name: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome to My App 🎉',
      text: `Hello ${name}, welcome to our platform!`,
      html: `<h3>Hello ${name},</h3><p>Welcome to our platform 🎉</p>`,
    });
  }

  async sendPasswordReset(to: string, token: string) {
    const resetUrl = `${this.baseUrl}/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });
  }

  async sendVerificationEmail(to: string, token: string, password: string) {
    const verifyUrl = `${this.baseUrl}/verify-email?token=${token}`;
    await this.mailerService.sendMail({
      to,
      subject: 'Your Asset Management Account Details',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome to Asset Management</h2>

        <p>An account has been created for you on the <strong>Asset Management</strong> platform.</p>
        
        <p>Here are your login details:</p>
        <ul style="list-style:none; padding-left:0;">
          <li><strong>Email:</strong> ${to}</li>
          <li><strong>Temporary Password:</strong> ${password}</li>
        </ul>

        <p>Before you can log in, please verify your email address by clicking the button below:</p>

        <p style="margin: 20px 0;">
          <a href="${verifyUrl}"
             style="background-color: #007bff; color: #fff; padding: 10px 20px;
             text-decoration: none; border-radius: 5px;">
             Verify Email
          </a>
        </p>

        <p>If the button above doesn’t work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #0066cc;">
          <a href="${verifyUrl}">${verifyUrl}</a>
        </p>

        <p>Once verified, you can log in and change your password from your account settings.</p>

        <br/>
        <p>Best regards,</p>
        <p><strong>The Asset Management Team</strong></p>
      </div>
    `,
    });
  }

  async sendAssetAssignmentEmail(
    to: string,
    assigneeName: string,
    assignedId: string,
    assetDetails: {
      assetType: string;
      serialNo: string;
      location: string;
      description?: string;
    },
  ) {
    const agreementLink = `${this.baseUrl}/asset-agreement?id=${encodeURIComponent(assignedId)}`;
    await this.mailerService.sendMail({
      to,
      subject: 'Asset Assignment Notification',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #007bff;">Asset Assignment Notification</h2>

        <p>Dear <strong>${assigneeName}</strong>,</p>

        <p>
          You have been assigned a new asset under the company's asset management system.
        </p>

        <h3>Asset Details:</h3>
        <ul style="list-style:none; padding-left:0; line-height: 1.6;">
          <li><strong>Asset Type:</strong> ${assetDetails.assetType}</li>
          <li><strong>Serial Number:</strong> ${assetDetails.serialNo}</li>
          <li><strong>Location:</strong> ${assetDetails.location}</li>
          ${
            assetDetails.description
              ? `<li><strong>Description:</strong> ${assetDetails.description}</li>`
              : ''
          }
        </ul>

        <p>
          Before you can officially take possession of this asset,
          please review and agree to the terms and conditions.
        </p>

        <p style="margin: 20px 0;">
          <a href="${agreementLink}"
             style="background-color: #28a745; color: #fff; padding: 10px 20px;
             text-decoration: none; border-radius: 5px;">
             Review & Accept Terms
          </a>
        </p>

        <p>
          If the button above doesn’t work, copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; color: #0066cc;">
          <a href="${agreementLink}">${agreementLink}</a>
        </p>

        <p>
          Kindly complete the agreement process within 48 hours of receiving this message.
        </p>

        <br/>
        <p>Best regards,</p>
        <p><strong>The Asset Management Team</strong></p>
      </div>
    `,
    });
  }

  // async sendVerificationEmail(to: string, token: string) {
  // const verifyUrl = `https://myapp.com/verify-email?token=${token}`;
  // await this.mailerService.sendMail({
  //   to,
  //   subject: 'Verify Your Email Address',
  //   html: `
  //     <p>Welcome to MyApp 🎉</p>
  //     <p>Please verify your email address by clicking the link below:</p>
  //     <p><a href="${verifyUrl}">Verify Email</a></p>
  //     <p>If you did not create an account, you can ignore this email.</p>
  //   `,
  // });
  // }
}
