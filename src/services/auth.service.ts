import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateTokens } from "@/config/jwt";
import { prisma } from "@/config/database";
import { EmailService } from "./email.service";
import crypto from "crypto";

export class AuthService {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    // Register user
    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }): Promise<{
        user: Omit<User, "password">;
        tokens: { accessToken: string; refreshToken: string };
    }> {
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new Error("User already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // Create user
        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                verificationToken,
                isVerified: false,
            },
        });

        // Send verification email
        await this.emailService.sendVerificationEmail(
            user.id,
            verificationToken
        );

        //Generate token
        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, tokens };
    }

    // Login user
    async login(
        email: string,
        password: string
    ): Promise<{
        user: Omit<User, "password">;
        tokens: { accessToken: string; refreshToken: string };
    }> {
        //Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        //Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid credentials");
        }

        // Generate tokens
        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, tokens };
    }

    // Verify email
    async verifyEmail(token: string): Promise<void> {
        const user = await prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            throw new Error("Invalid verification token");
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
            },
        });
    }

    // Request password reset
    async requestPasswordReset(email: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal that the user doesn't exist
            return;
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        await this.emailService.sendPasswordResetEmail(user.id, resetToken);
    }

    // Reset password
    async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            throw new Error("Invalid or expired reset token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
    }
}
