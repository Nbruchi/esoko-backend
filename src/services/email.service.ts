import nodemailer from "nodemailer";
import { prisma } from "@/config/database";
import { sendEmail } from "@/config/email";

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

    async sendVerificationEmail(userId: string, email: string): Promise<void> {
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                userId,
                type: "EMAIL_VERIFICATION",
                expiresAt: { gt: new Date() },
            },
        });

        if (!verificationToken) {
            throw new Error("No valid verification token found");
        }

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken.token}`;

        await sendEmail({
            to: email,
            subject: "Verify your email address",
            html: `
                <h1>Welcome to Esoko!</h1>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you did not create an account, please ignore this email.</p>
            `,
        });
    }

    async sendPasswordResetEmail(userId: string, token: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await sendEmail({
            to: user.email,
            subject: "Reset your password",
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            `,
        });
    }

    async sendOrderConfirmationEmail(
        userId: string,
        orderId: string
    ): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            throw new Error("Order not found");
        }

        const totalAmount = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        await sendEmail({
            to: user.email,
            subject: "Order Confirmation",
            html: `
                <h1>Order Confirmation</h1>
                <p>Thank you for your order!</p>
                <p>Order ID: ${order.id}</p>
                <p>Total: ${totalAmount}</p>
                <h2>Order Items:</h2>
                <ul>
                    ${order.items
                        .map(
                            (item) => `
                        <li>
                            ${item.product.name} x ${item.quantity} - ${item.price}
                        </li>
                    `
                        )
                        .join("")}
                </ul>
            `,
        });
    }
}
