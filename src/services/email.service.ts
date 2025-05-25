import nodemailer from "nodemailer";
import { prisma } from "@/config/database";

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendVerificationEmail(userId: string, token: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, firstName: true },
        });

        if (!user) throw new Error("User not found");

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
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
        });
    }

    async sendPasswordResetEmail(userId: string, token: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, firstName: true },
        });

        if (!user) throw new Error("User not found");

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
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
        });
    }

    async sendOrderConfirmationEmail(
        userId: string,
        orderId: string
    ): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, firstName: true },
        });

        if (!user) throw new Error("User not found");

        const orderUrl = `${process.env.FRONTEND_URL}/orders/${orderId}`;

        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: user.email,
            subject: "Order Confirmation",
            html: `
                <h1>Order Confirmed!</h1>
                <p>Hi ${user.firstName},</p>
                <p>Your order has been confirmed. You can view your order details here:</p>
                <a href="${orderUrl}">View Order</a>
                <p>Thank you for shopping with us!</p>
            `,
        });
    }
}
