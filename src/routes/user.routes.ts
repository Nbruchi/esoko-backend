import { Router } from "express";
import { UserController } from "@/controllers/user.controller";

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", userController.updateProfile);

/**
 * @swagger
 * /api/users/settings:
 *   put:
 *     tags: [Users]
 *     summary: Update user settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *               theme:
 *                 type: string
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put("/settings", userController.updateSettings);

/**
 * @swagger
 * /api/users/notifications:
 *   put:
 *     tags: [Users]
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
 *               orderUpdates:
 *                 type: boolean
 *               promotions:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put("/notifications", userController.updateNotificationPreferences);

/**
 * @swagger
 * /api/users/addresses:
 *   get:
 *     tags: [Users]
 *     summary: Get user addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user addresses
 *       401:
 *         description: Unauthorized
 */
router.get("/addresses", userController.getAddresses);

/**
 * @swagger
 * /api/users/addresses:
 *   post:
 *     tags: [Users]
 *     summary: Add new address
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - state
 *               - country
 *               - zipCode
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/addresses", userController.addAddress);

/**
 * @swagger
 * /api/users/addresses/{addressId}:
 *   put:
 *     tags: [Users]
 *     summary: Update address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               zipCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.put("/addresses/:addressId", userController.updateAddress);

/**
 * @swagger
 * /api/users/addresses/{addressId}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.delete("/addresses/:addressId", userController.deleteAddress);

/**
 * @swagger
 * /api/users/addresses/{addressId}/default:
 *   put:
 *     tags: [Users]
 *     summary: Set default address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Default address set successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.put("/addresses/:addressId/default", userController.setDefaultAddress);

/**
 * @swagger
 * /api/users/statistics:
 *   get:
 *     tags: [Users]
 *     summary: Get user statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/statistics", userController.getUserStatistics);

/**
 * @swagger
 * /api/users/activity:
 *   get:
 *     tags: [Users]
 *     summary: Get user activity
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity history
 *       401:
 *         description: Unauthorized
 */
router.get("/activity", userController.getUserActivity);

/**
 * @swagger
 * /api/users/analytics:
 *   get:
 *     tags: [Users]
 *     summary: Get user behavior analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User behavior analytics
 *       401:
 *         description: Unauthorized
 */
router.get("/analytics", userController.getUserBehaviorAnalytics);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/account", userController.deleteAccount);

export default router;
