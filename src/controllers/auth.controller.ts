import { Request, Response } from "express";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    //Register new user
    async register(req: Request, res: Response) {
        try {
            const user = await this.authService.register(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    //Login useer
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                message: (error as Error).message,
            });
        }
    }

    //Verify email
    async verifyEmail(req: Request, res: Response) {
        try {
            const { token } = req.params;
            await this.authService.verifyEmail(token);
            res.json({ message: `Email verified successfully` });
        } catch (error) {
            res.status(400).json({
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
});        }
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
});        }
    }
}
