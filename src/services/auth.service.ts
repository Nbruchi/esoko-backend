import { User, UserRole } from "@prisma/client";
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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // Create user with role (defaults to CUSTOMER if not specified)
        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                verificationToken,
                isVerified: false,
                role: userData.role || "CUSTOMER",
            },
        });

        // Send verification email
        await this.emailService.sendVerificationEmail(
            user.id,
            verificationToken
        );

        // Generate tokens
        const tokens = await this.generateAndStoreTokens(user);

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, tokens };
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
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid credentials");
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // Generate tokens
        const tokens = await this.generateAndStoreTokens(user, rememberMe);

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, tokens };
    }

    // Refresh token
    async refreshToken(token: string): Promise<{
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
        const tokens = await this.generateAndStoreTokens(refreshToken.user);

        // Delete old refresh token
        await prisma.refreshToken.delete({
            where: { id: refreshToken.id },
        });

        return tokens;
    }

    // Logout
    async logout(userId: string): Promise<void> {
        // Delete all refresh tokens for the user
        await prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    // Private helper to generate and store tokens
    private async generateAndStoreTokens(
        user: User,
        rememberMe?: boolean
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

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );
        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
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

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
