import { Router } from "express";
import { NotificationController } from "@/controllers/notification.controller";

const router = Router();
const notificationController = new NotificationController();

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Create a new notification
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
 *               - type
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ORDER, PROMOTION, SYSTEM, ALERT]
 *               message:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", notificationController.createNotification);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
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
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get("/", notificationController.getUserNotifications);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.put("/:notificationId/read", notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.put("/read-all", notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete("/:notificationId", notificationController.deleteNotification);

/**
 * @swagger
 * /api/notifications/unread/count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notifications count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/unread/count", notificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     tags: [Notifications]
 *     summary: Create multiple notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notifications
 *             properties:
 *               notifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - userId
 *                     - type
 *                     - message
 *                   properties:
 *                     userId:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [ORDER, PROMOTION, SYSTEM, ALERT]
 *                     message:
 *                       type: string
 *                     metadata:
 *                       type: object
 *     responses:
 *       201:
 *         description: Notifications created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/bulk", notificationController.createBulkNotification);

/**
 * @swagger
 * /api/notifications/type/{type}:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notifications by type
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ORDER, PROMOTION, SYSTEM, ALERT]
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
 *         description: List of notifications by type
 *       401:
 *         description: Unauthorized
 */
router.get("/type/:type", notificationController.getNotificationsByType);

/**
 * @swagger
 * /api/notifications:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete all notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.delete("/", notificationController.deleteAllNotifications);

/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     tags: [Notifications]
 *     summary: Update notification preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: boolean
 *               push:
 *                 type: boolean
 *               sms:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put(
    "/preferences",
    notificationController.updateNotificationPreferences
);

/**
 * @swagger
 * /api/notifications/template:
 *   post:
 *     tags: [Notifications]
 *     summary: Create notification with template
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
 *               - type
 *               - template
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ORDER, PROMOTION, SYSTEM, ALERT]
 *               template:
 *                 type: string
 *               variables:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/template", notificationController.createNotificationWithTemplate);

/**
 * @swagger
 * /api/notifications/category/{category}:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notifications by category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [order, promotion, system, alert]
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
 *         description: List of notifications by category
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/category/:category",
    notificationController.getNotificationsByCategory
);

/**
 * @swagger
 * /api/notifications/priority:
 *   post:
 *     tags: [Notifications]
 *     summary: Create high priority notification
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
 *               - type
 *               - message
 *               - priority
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ORDER, PROMOTION, SYSTEM, ALERT]
 *               message:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [HIGH, MEDIUM, LOW]
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: High priority notification created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/priority", notificationController.createHighPriorityNotification);

/**
 * @swagger
 * /api/notifications/expiring:
 *   post:
 *     tags: [Notifications]
 *     summary: Create expiring notification
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
 *               - type
 *               - message
 *               - expiresAt
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ORDER, PROMOTION, SYSTEM, ALERT]
 *               message:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Expiring notification created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/expiring", notificationController.createExpiringNotification);

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", notificationController.getNotificationStats);

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User notification preferences
 *       401:
 *         description: Unauthorized
 */
router.get("/preferences", notificationController.getNotificationPreferences);

export default router;
