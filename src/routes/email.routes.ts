import { Router } from "express";
import { EmailController } from "@/controllers/email.controller";

const router = Router();
const emailController = new EmailController();

/**
 * @swagger
 * /api/email/verification:
 *   post:
 *     tags: [Email]
 *     summary: Send verification email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: User ID and token are required
 *       401:
 *         description: Unauthorized
 */
router.post("/verification", emailController.sendVerificationEmail);

/**
 * @swagger
 * /api/email/password-reset:
 *   post:
 *     tags: [Email]
 *     summary: Send password reset email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       400:
 *         description: User ID and token are required
 *       401:
 *         description: Unauthorized
 */
router.post("/password-reset", emailController.sendPasswordResetEmail);

/**
 * @swagger
 * /api/email/order-confirmation:
 *   post:
 *     tags: [Email]
 *     summary: Send order confirmation email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - orderId
 *             properties:
 *               userId:
 *                 type: string
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order confirmation email sent successfully
 *       400:
 *         description: User ID and order ID are required
 *       401:
 *         description: Unauthorized
 */
router.post("/order-confirmation", emailController.sendOrderConfirmationEmail);

export default router;
