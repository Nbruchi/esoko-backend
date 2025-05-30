import { Request, Response } from "express";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import {
    loginLimiter,
    refreshTokenLimiter,
    passwordResetLimiter,
    registerLimiter,
} from "@/middleware/rateLimit";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    //Register new user
    register = async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.string().email("Invalid email address"),
                password: z
                    .string()
                    .min(8, "Password must be at least 8 characters")
                    .regex(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                    ),
                firstName: z
                    .string()
                    .min(2, "First name must be at least 2 characters"),
                lastName: z
                    .string()
                    .min(2, "Last name must be at least 2 characters"),
                phoneNumber: z
                    .string()
                    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
                    .optional(),
                profilePhoto: z
                    .string()
                    .url("Invalid profile photo URL")
                    .optional(),
            });

            const userData = schema.parse(req.body);
            const result = await this.authService.register(userData);
            res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Validation error",
                    errors: error.errors.map((err) => ({
                        path: err.path,
                        message: err.message,
                    })),
                });
            }
            res.status(400).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    //Login user
    login = async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.string().email(),
                password: z.string(),
                rememberMe: z.boolean().optional(),
            });

            const { email, password, rememberMe } = schema.parse(req.body);
            const result = await this.authService.login(
                email,
                password,
                rememberMe
            );
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Validation error",
                    errors: error.errors.map((err) => ({
                        path: err.path,
                        message: err.message,
                    })),
                });
            }
            res.status(400).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    //Refresh token
    refreshToken = async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                refreshToken: z.string(),
            });

            const { refreshToken } = schema.parse(req.body);
            const deviceInfo = req.headers["user-agent"] || "Unknown Device";

            const result = await this.authService.refreshToken(
                refreshToken,
                deviceInfo
            );
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    //Verify email
    verifyEmail = async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                token: z.string(),
            });

            const { token } = schema.parse(req.body);
            await this.authService.verifyEmail(token);
            res.status(200).json({
                success: true,
                message: "Email verified successfully",
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    //Resend verification OTP
    resendVerificationOTP = async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.string().email("Invalid email address"),
            });

            const { email } = schema.parse(req.body);
            await this.authService.resendVerificationOTP(email);
            res.json({
                success: true,
                message: "New OTP sent successfully",
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Validation error",
                    errors: error.errors.map((err) => ({
                        path: err.path,
                        message: err.message,
                    })),
                });
            }
            res.status(400).json({
                success: false,
                message: (error as Error).message,
            });
        }
    };

    //Request password reset
    requestPasswordReset = async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.string().email(),
            });

            const { email } = schema.parse(req.body);
            await this.authService.requestPasswordReset(email);
            res.status(200).json({
                success: true,
                message: "Password reset instructions sent to your email",
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Validation error",
                    errors: error.errors.map((err) => ({
                        path: err.path,
                        message: err.message,
                    })),
                });
            }
            res.status(400).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    //Reset password
    resetPassword = async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                token: z.string(),
                newPassword: z.string().min(8),
            });

            const { token, newPassword } = schema.parse(req.body);
            await this.authService.resetPassword(token, newPassword);
            res.status(200).json({
                success: true,
                message: "Password reset successfully",
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Validation error",
                    errors: error.errors.map((err) => ({
                        path: err.path,
                        message: err.message,
                    })),
                });
            }
            res.status(400).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    //Change password
    changePassword = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;
            const { currentPassword, newPassword } = req.body;

            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }

            await this.authService.changePassword(
                userId,
                currentPassword,
                newPassword
            );
            res.json({ message: `Password updated successfully!` });
        } catch (error) {
            res.status(400).json({
                message: (error as Error).message,
            });
        }
    };

    // Get user sessions
    getUserSessions = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            const sessions = await this.authService.getUserSessions(userId);
            res.status(200).json({
                success: true,
                data: sessions,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    // Revoke session
    revokeSession = async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                tokenId: z.string(),
            });

            const { tokenId } = schema.parse(req.body);
            const userId = req.user?.userId;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            await this.authService.revokeSession(tokenId, userId);
            res.status(200).json({
                success: true,
                message: "Session revoked successfully",
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    // Revoke all sessions
    revokeAllSessions = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            await this.authService.revokeAllSessions(userId);
            res.status(200).json({
                success: true,
                message: "All sessions revoked successfully",
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    // Logout
    logout = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            await this.authService.logout(userId);
            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: (error as Error).message,
            });
        }
    };

    // Get current user
    getCurrentUser = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }

            const user = await this.authService.getCurrentUser(userId);
            res.json(user);
        } catch (error) {
            res.status(400).json({
                message: (error as Error).message,
            });
        }
    };
}
