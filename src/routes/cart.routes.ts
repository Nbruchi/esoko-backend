import { Router } from "express";
import { CartController } from "@/controllers/cart.controller";

const router = Router();
const cartController = new CartController();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get user's cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", cartController.getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 */
router.post("/items", cartController.addToCart);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
router.put("/items/:productId", cartController.updateCartItem);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
router.delete("/items/:productId", cartController.removeFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/clear", cartController.clearCart);

/**
 * @swagger
 * /api/cart/total:
 *   get:
 *     tags: [Cart]
 *     summary: Get cart total
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart total retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/total", cartController.getCartTotal);

/**
 * @swagger
 * /api/cart/validate:
 *   get:
 *     tags: [Cart]
 *     summary: Validate cart items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart validation results
 *       401:
 *         description: Unauthorized
 */
router.get("/validate", cartController.validateCart);

export default router;
