import { Request, Response } from "express";
import { PaymentService } from "@/services/payment.service";
import { PaymentMethod } from "@prisma/client";

export class PaymentController {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
    }

    // Create payment
    async createPayment(req: Request, res: Response) {
        try {
            const { orderId, method, amount } = req.body;
            if (!orderId || !method || !amount) {
                return res.status(400).json({
                    message:
                        "Order ID, payment method, and amount are required",
                });
            }
            const payment = await this.paymentService.createPayment(
                orderId,
                method as PaymentMethod,
                amount
            );
            res.status(201).json(payment);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Confirm payment
    async confirmPayment(req: Request, res: Response) {
        try {
            const { paymentId, method } = req.body;
            if (!paymentId || !method) {
                return res.status(400).json({
                    message: "Payment ID and method are required",
                });
            }
            const payment = await this.paymentService.confirmPayment(
                paymentId,
                method as PaymentMethod
            );
            res.json(payment);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Handle webhook
    async handleWebhook(req: Request, res: Response) {
        try {
            const event = req.body;
            await this.paymentService.handleWebhook(event);
            res.json({ received: true });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
