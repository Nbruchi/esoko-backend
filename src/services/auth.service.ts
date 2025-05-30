import { User, UserRole, TokenType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateTokens } from "@/config/jwt";
import { prisma } from "@/config/database";
import { EmailService } from "./email.service";
import crypto from "crypto";
import { Request } from "express";

export class AuthService {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    // Generate OTP
    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Register user
    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        profilePhoto?: string;
        role?: UserRole;
    }): Promise<{
        user: Omit<User, "password">;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresAt: number;
        };
    }> {
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new Error("Email already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user and auth in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    ...userData,
                    isVerified: false,
                    role: userData.role || "CUSTOMER",
                },
            });

            // Create auth record
            await tx.auth.create({
                data: {
                    userId: user.id,
                    password: hashedPassword,
                },
            });

            // Create verification token
            const verificationToken = crypto.randomBytes(32).toString("hex");
            await tx.verificationToken.create({
                data: {
                    userId: user.id,
                    token: verificationToken,
                    type: "EMAIL_VERIFICATION",
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                },
            });

            return user;
        });

        // Send verification email
        await this.emailService.sendVerificationEmail(result.id, result.email);

        // Generate tokens
        const tokens = await this.generateAndStoreTokens(result);

        return { user: result, tokens };
    }

    // Resend verification OTP
    async resendVerificationOTP(email: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (user.isVerified) {
            throw new Error("Email is already verified");
        }

        // Create new verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                token: verificationToken,
                type: "EMAIL_VERIFICATION",
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
        });

        // Send new verification email
        await this.emailService.sendVerificationEmail(user.id, user.email);
    }

    // Verify email
    async verifyEmail(token: string): Promise<void> {
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                token,
                type: "EMAIL_VERIFICATION",
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
        });

        if (!verificationToken) {
            throw new Error("Invalid or expired verification token");
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: verificationToken.userId },
                data: { isVerified: true },
            }),
            prisma.verificationToken.delete({
                where: { id: verificationToken.id },
            }),
        ]);
    }

    // Login user
    async login(
        email: string,
        password: string,
        rememberMe?: boolean
    ): Promise<{
        user: Omit<User, "password">;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresAt: number;
        };
    }> {
        // Find user and auth
        const user = await prisma.user.findUnique({
            where: { email },
            include: { auth: true },
        });

        if (!user || !user.auth) {
            throw new Error("Invalid credentials");
        }

        // Check if account is locked
        if (
            user.auth.isLocked &&
            user.auth.lockedUntil &&
            user.auth.lockedUntil > new Date()
        ) {
            throw new Error("Account is locked. Please try again later.");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
            password,
            user.auth.password
        );
        if (!isValidPassword) {
            // Update login attempts
            await prisma.auth.update({
                where: { userId: user.id },
                data: {
                    loginAttempts: { increment: 1 },
                    lastAttempt: new Date(),
                    isLocked: user.auth.loginAttempts >= 4,
                    lockedUntil:
                        user.auth.loginAttempts >= 4
                            ? new Date(Date.now() + 15 * 60 * 1000)
                            : null, // Lock for 15 minutes
                },
            });
            throw new Error("Invalid credentials");
        }

        // Reset login attempts on successful login
        await prisma.auth.update({
            where: { userId: user.id },
            data: {
                loginAttempts: 0,
                lastLogin: new Date(),
                isLocked: false,
                lockedUntil: null,
            },
        });

        // Generate tokens
        const tokens = await this.generateAndStoreTokens(user, rememberMe);

        return { user, tokens };
    }

    // Private helper to generate and store tokens
    private async generateAndStoreTokens(
        user: User,
        rememberMe?: boolean,
        deviceInfo?: string
    ): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
    }> {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const { accessToken, refreshToken } = generateTokens(payload);

        // Calculate expiration (15 minutes for access token)
        const expiresAt = Date.now() + 15 * 60 * 1000;

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(
                    Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
                ), // 30 days if remember me, 7 days otherwise
            },
        });

        return { accessToken, refreshToken, expiresAt };
    }

    // Refresh token
    async refreshToken(
        token: string,
        deviceInfo: string
    ): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
    }> {
        // Find refresh token
        const refreshToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!refreshToken || refreshToken.expiresAt < new Date()) {
            throw new Error("Invalid or expired refresh token");
        }

        // Generate new tokens
        const tokens = await this.generateAndStoreTokens(
            refreshToken.user,
            true, // Keep the same remember me setting
            deviceInfo
        );

        // Delete old refresh token
        await prisma.refreshToken.delete({
            where: { id: refreshToken.id },
        });

        return tokens;
    }

    // Get all active sessions for a user
    async getUserSessions(userId: string) {
        return prisma.refreshToken.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                expiresAt: true,
                createdAt: true,
            },
        });
    }

    // Revoke a specific session
    async revokeSession(tokenId: string, userId: string) {
        return prisma.refreshToken.delete({
            where: {
                id: tokenId,
                userId, // Ensure the token belongs to the user
            },
        });
    }

    // Revoke all sessions for a user
    async revokeAllSessions(userId: string) {
        return prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    // Logout
    async logout(userId: string): Promise<void> {
        // Delete all refresh tokens for the user
        await prisma.refreshToken.deleteMany({
            where: { userId },
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
        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                token: resetToken,
                type: "PASSWORD_RESET",
                expiresAt: new Date(Date.now() + 3600000), // 1 hour
            },
        });

        await this.emailService.sendPasswordResetEmail(user.id, resetToken);
    }

    // Reset password
    async resetPassword(token: string, newPassword: string): Promise<void> {
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                token,
                type: "PASSWORD_RESET",
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
        });

        if (!verificationToken) {
            throw new Error("Invalid or expired reset token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.$transaction([
            prisma.auth.update({
                where: { userId: verificationToken.userId },
                data: { password: hashedPassword },
            }),
            prisma.verificationToken.delete({
                where: { id: verificationToken.id },
            }),
        ]);
    }

    // Change password
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const auth = await prisma.auth.findUnique({
            where: { userId },
        });

        if (!auth) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            auth.password
        );
        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.auth.update({
            where: { userId },
            data: { password: hashedPassword },
        });
    }

    async getCurrentUser(userId: string): Promise<Omit<User, "password">> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                addresses: true,
                sellerProfile: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }
}
