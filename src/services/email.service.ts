import nodemailer from "nodemailer";
import { prisma } from "@/config/database";

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        if (
            !process.env.SMTP_HOST ||
            !process.env.SMTP_USER ||
            !process.env.SMTP_PASS
        ) {
            throw new Error(
                "SMTP configuration is missing. Please check your environment variables."
            );
        }

        this.transporter = nodemailer.createTransport({
            service: "gmail", // Use Gmail service instead of manual configuration
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Only use this in development
            },
        });

        // Verify SMTP connection
        this.transporter.verify((error, success) => {
            if (error) {
                console.error("SMTP connection error:", error);
            } else {
                console.log("SMTP server is ready to send emails");
            }
        });
    }

    async sendVerificationEmail(userId: string, token: string): Promise<void> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, firstName: true },
            });

            if (!user) throw new Error("User not found");

            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

            const mailOptions = {
                from: `"Esoko" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: "Verify your email address",
                html: `
                    <h1>Welcome to Esoko!</h1>
                    <p>Hi ${user.firstName},</p>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${verificationUrl}">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                `,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log("Verification email sent:", info.messageId);
        } catch (error) {
            console.error("Error sending verification email:", error);
            throw new Error(
                "Failed to send verification email. Please try again later."
            );
        }
    }

    async sendPasswordResetEmail(userId: string, token: string): Promise<void> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, firstName: true },
            });

            if (!user) throw new Error("User not found");

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

            const mailOptions = {
                from: `"Esoko" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: "Reset your password",
                html: `
                    <h1>Password Reset Request</h1>
                    <p>Hi ${user.firstName},</p>
                    <p>You requested to reset your password. Click the link below to set a new password:</p>
                    <a href="${resetUrl}">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                `,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log("Password reset email sent:", info.messageId);
        } catch (error) {
            console.error("Error sending password reset email:", error);
            throw new Error(
                "Failed to send password reset email. Please try again later."
            );
        }
    }

    async sendOrderConfirmationEmail(
        userId: string,
        orderId: string
    ): Promise<void> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, firstName: true },
            });

            if (!user) throw new Error("User not found");

            const orderUrl = `${process.env.FRONTEND_URL}/orders/${orderId}`;

            const mailOptions = {
                from: `"Esoko" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: "Order Confirmation",
                html: `
                    <h1>Order Confirmed!</h1>
                    <p>Hi ${user.firstName},</p>
                    <p>Your order has been confirmed. You can view your order details here:</p>
                    <a href="${orderUrl}">View Order</a>
                    <p>Thank you for shopping with us!</p>
                `,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log("Order confirmation email sent:", info.messageId);
        } catch (error) {
            console.error("Error sending order confirmation email:", error);
            throw new Error(
                "Failed to send order confirmation email. Please try again later."
            );
        }
    }
}
