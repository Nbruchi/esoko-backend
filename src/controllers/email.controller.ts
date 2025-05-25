import { Request, Response } from "express";
import { EmailService } from "@/services/email.service";

export class EmailController {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    // Send verification email
    async sendVerificationEmail(req: Request, res: Response) {
        try {
            const { userId, token } = req.body;
            if (!userId || !token) {
                return res.status(400).json({
                    message: "User ID and token are required",
                });
            }
            await this.emailService.sendVerificationEmail(userId, token);
            res.json({ message: "Verification email sent successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(req: Request, res: Response) {
        try {
            const { userId, token } = req.body;
            if (!userId || !token) {
                return res.status(400).json({
                    message: "User ID and token are required",
                });
            }
            await this.emailService.sendPasswordResetEmail(userId, token);
            res.json({ message: "Password reset email sent successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Send order confirmation email
    async sendOrderConfirmationEmail(req: Request, res: Response) {
        try {
            const { userId, orderId } = req.body;
            if (!userId || !orderId) {
                return res.status(400).json({
                    message: "User ID and order ID are required",
                });
            }
            await this.emailService.sendOrderConfirmationEmail(userId, orderId);
            res.json({ message: "Order confirmation email sent successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
