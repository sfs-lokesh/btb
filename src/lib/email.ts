import nodemailer from 'nodemailer';
import { generateQRCodeBuffer } from './qrcode';
import { generateTicketPDF } from './pdf';

// Email configuration from environment variables
const EMAIL_CONFIG = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'Behind The Build <noreply@behindthebuild.com>';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport(EMAIL_CONFIG);
    }
    return transporter;
}

export interface RegistrationEmailData {
    name: string;
    email: string;
    role: string;
    ticketId: string;
    userId: string;
    qrCodeData: string;
    finalPrice?: number;
    discount?: number;
    couponType?: string;
}

/**
 * Send registration confirmation email with QR code
 */
export async function sendRegistrationEmail(data: RegistrationEmailData): Promise<boolean> {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('Email service not configured. Skipping email send.');
            return false;
        }

        // Generate QR code as buffer for attachment
        // Use the exact qrCodeData string that is stored in the database
        const qrCodeBuffer = await generateQRCodeBuffer(data.qrCodeData, {
            size: 400,
            errorCorrectionLevel: 'H',
            color: {
                dark: '#1a1a1a',
                light: '#ffffff'
            }
        });

        // Create email HTML template
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .ticket-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #667eea;
        }
        .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Registration Confirmed!</h1>
        <p>Behind The Build 2024</p>
    </div>
    
    <div class="content">
        <p>Dear ${data.name},</p>
        
        <p>Thank you for registering for <strong>Behind The Build 2024</strong>! Your registration has been confirmed.</p>
        
        <div class="ticket-info">
            <h3>📋 Registration Details</h3>
            <div class="info-row">
                <span class="label">Name:</span>
                <span>${data.name}</span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span>${data.email}</span>
            </div>
            <div class="info-row">
                <span class="label">Role:</span>
                <span>${data.role}</span>
            </div>
            <div class="info-row">
                <span class="label">Ticket ID:</span>
                <span>${data.ticketId}</span>
            </div>
            ${data.finalPrice !== undefined ? `
            <div class="info-row">
                <span class="label">Amount Paid:</span>
                <span>₹${data.finalPrice}</span>
            </div>
            ` : ''}
            ${data.discount ? `
            <div class="info-row">
                <span class="label">Discount Applied:</span>
                <span>₹${data.discount} (${data.couponType})</span>
            </div>
            ` : ''}
        </div>
        
        <div class="qr-section">
            <h3>🎫 Your Entry Pass</h3>
            <p>Please find your QR code attached to this email. You'll need to present this at the venue for entry.</p>
            <p><strong>Important:</strong> Save this QR code on your phone or print it out.</p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <strong>⚠️ Important Instructions:</strong>
            <ul>
                <li>Bring a valid ID proof along with your QR code</li>
                <li>Entry is allowed only with a valid QR code</li>
                <li>QR code is non-transferable</li>
                <li>Reach the venue 30 minutes before the event starts</li>
            </ul>
        </div>
        
        <p style="margin-top: 30px;">We're excited to see you at the event!</p>
        
        <p>Best regards,<br>
        <strong>Behind The Build Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>For any queries, contact us at support@behindthebuild.com</p>
    </div>
</body>
</html>
        `;

        // Generate PDF Ticket
        const pdfBuffer = await generateTicketPDF({
            ticketId: data.ticketId,
            name: data.name,
            email: data.email,
            role: data.role,
            qrCodeData: data.qrCodeData,
            price: data.finalPrice
        });

        // Send email
        const mailOptions = {
            from: EMAIL_FROM,
            to: data.email,
            subject: '🎉 Registration Confirmed - Behind The Build 2024',
            html: htmlContent,
            attachments: [
                {
                    filename: `Ticket-${data.ticketId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const transporter = getTransporter();
        if (!transporter) return false;

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;

    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

/**
 * Send bulk email to multiple recipients
 */
export async function sendBulkEmail(
    recipients: string[],
    subject: string,
    htmlContent: string
): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const transporter = getTransporter();
    if (!transporter) return { success: 0, failed: recipients.length };

    for (const email of recipients) {
        try {
            await transporter.sendMail({
                from: EMAIL_FROM,
                to: email,
                subject,
                html: htmlContent
            });
            success++;
        } catch (error) {
            console.error(`Failed to send email to ${email}:`, error);
            failed++;
        }
    }

    return { success, failed };
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
    try {
        const transporter = getTransporter();
        if (!transporter) return false;

        await transporter.verify();
        console.log('Email server is ready');
        return true;
    } catch (error) {
        console.error('Email server verification failed:', error);
        return false;
    }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    try {
        const transporter = getTransporter();
        if (!transporter) return false;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your Behind The Build account.</p>
    <p>Please click the button below to reset your password:</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p>Or copy and paste this link in your browser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
</body>
</html>
        `;

        await transporter.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: 'Password Reset Request - Behind The Build',
            html: htmlContent
        });

        return true;
    } catch (error) {
        console.error('Error sending reset email:', error);
        return false;
    }
}
