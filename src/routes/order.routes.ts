import { Router } from "express";
import { OrderController } from "@/controllers/order.controller";

const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *               - items
 *               - paymentMethod
 *             properties:
 *               addressId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CARD, MOBILE_MONEY]
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", orderController.createOrder);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get("/:orderId", orderController.getOrderById);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get user orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of user orders
 *       401:
 *         description: Unauthorized
 */
router.get("/", orderController.getUserOrders);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.put("/:orderId/status", orderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderId}/payment:
 *   put:
 *     tags: [Orders]
 *     summary: Update payment status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, FAILED, REFUNDED]
 *     responses:
 *       200:
 *         description: Payment status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.put("/:orderId/payment", orderController.updatePaymentStatus);

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancel order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post("/:orderId/cancel", orderController.cancelOrder);

/**
 * @swagger
 * /api/orders/status/{status}:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders by status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of orders by status
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 */
router.get("/status/:status", orderController.getOrdersByStatus);

/**
 * @swagger
 * /api/orders/date-range:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders by date range
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of orders in date range
 *       400:
 *         description: Invalid date range
 *       401:
 *         description: Unauthorized
 */
router.get("/date-range", orderController.getOrdersByDateRange);

/**
 * @swagger
 * /api/orders/statistics:
 *   get:
 *     tags: [Orders]
 *     summary: Get order statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/statistics", orderController.getOrderStatistics);

/**
 * @swagger
 * /api/orders/user-statistics:
 *   get:
 *     tags: [Orders]
 *     summary: Get user order statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User order statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/user-statistics", orderController.getUserOrderStatistics);

/**
 * @swagger
 * /api/orders/analytics/sales-trend:
 *   get:
 *     tags: [Orders]
 *     summary: Get sales trend analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *     responses:
 *       200:
 *         description: Sales trend analytics
 *       400:
 *         description: Invalid time range
 *       401:
 *         description: Unauthorized
 */
router.get("/analytics/sales-trend", orderController.getSalesTrendAnalytics);

/**
 * @swagger
 * /api/orders/analytics/marketing:
 *   get:
 *     tags: [Orders]
 *     summary: Get marketing analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *     responses:
 *       200:
 *         description: Marketing analytics
 *       400:
 *         description: Invalid time range
 *       401:
 *         description: Unauthorized
 */
router.get("/analytics/marketing", orderController.getMarketingAnalytics);

export default router;
