import { Router } from "express";
import { PaymentController } from "@/controllers/payment.controller";

const router = Router();
const paymentController = new PaymentController();

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create a new payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - method
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *               method:
 *                 type: string
 *                 enum: [CASH, CARD, MOBILE_MONEY]
 *               amount:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", paymentController.createPayment);

/**
 * @swagger
 * /api/payments/confirm:
 *   post:
 *     tags: [Payments]
 *     summary: Confirm a payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *               - method
 *             properties:
 *               paymentId:
 *                 type: string
 *               method:
 *                 type: string
 *                 enum: [CASH, CARD, MOBILE_MONEY]
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/confirm", paymentController.confirmPayment);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Handle payment webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payment provider webhook event data
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *       400:
 *         description: Invalid webhook data
 */
router.post("/webhook", paymentController.handleWebhook);

export default router;
