import { Request, Response } from "express";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";
import { UserRole } from "@prisma/client";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    //Register new user
    async register(req: Request, res: Response) {
        try {
            // Validate request body
            const schema = z.object({
                email: z.string().email("Invalid email address"),
                password: z
                    .string()
                    .min(8, "Password must be at least 8 characters")
                    .regex(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
                    ),
                firstName: z
                    .string()
                    .min(2, "First name must be at least 2 characters"),
                lastName: z
                    .string()
                    .min(2, "Last name must be at least 2 characters"),
                phoneNumber: z.string().optional(),
                role: z
                    .enum(["CUSTOMER", "SELLER", "ADMIN"] as const)
                    .optional(),
            });

            const validatedData = schema.parse(req.body);
            const result = await this.authService.register(validatedData);
            res.status(201).json({
                success: true,
                data: result,
                redirect: `/auth/verify-email?email=${encodeURIComponent(validatedData.email)}`,
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
    }

    //Login user
    async login(req: Request, res: Response) {
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
    }

    //Refresh token
    async refreshToken(req: Request, res: Response) {
        try {
            const schema = z.object({
                refreshToken: z.string(),
            });

            const { refreshToken } = schema.parse(req.body);
            const tokens = await this.authService.refreshToken(refreshToken);
            res.status(200).json(tokens);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: error.errors,
                });
            }
            res.status(400).json({ message: (error as Error).message });
        }
    }

    //Verify email
    async verifyEmail(req: Request, res: Response) {
        try {
            const schema = z.object({
                otp: z.string().length(6, "OTP must be 6 digits"),
            });

            const { otp } = schema.parse(req.body);
            await this.authService.verifyEmail(otp);
            res.json({
                success: true,
                message: "Email verified successfully",
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
    }

    //Resend verification OTP
    async resendVerificationOTP(req: Request, res: Response) {
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
    }

    //Request password reset
    async requestPasswordReset(req: Request, res: Response) {
        try {
            const { email } = req.body;
            await this.authService.requestPasswordReset(email);
            res.json({ message: `Password reset instructions sent to email` });
        } catch (error) {
            res.status(400).json({
                message: (error as Error).message,
            });
        }
    }

    //Reset password
    async resetPassword(req: Request, res: Response) {
        try {
            const { token, password } = req.body;
            await this.authService.resetPassword(token, password);
            res.json({ message: `Password reset successful` });
        } catch (error) {
            res.status(400).json({
                message: (error as Error).message,
            });
        }
    }

    //Change password
    async changePassword(req: Request, res: Response) {
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
    }

    // Logout
    async logout(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }

            await this.authService.logout(userId);
            res.json({ message: "Logged out successfully" });
        } catch (error) {
            res.status(400).json({
                message: (error as Error).message,
            });
        }
    }

    // Get current user
    async getCurrentUser(req: Request, res: Response) {
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
    }
}
