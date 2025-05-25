import { Router } from "express";
import { SellerController } from "@/controllers/seller.controller";

const router = Router();
const sellerController = new SellerController();

/**
 * @swagger
 * /api/sellers:
 *   post:
 *     tags: [Sellers]
 *     summary: Create a new seller profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - description
 *             properties:
 *               businessName:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Seller profile created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", sellerController.createSellerProfile);

/**
 * @swagger
 * /api/sellers/{id}:
 *   get:
 *     tags: [Sellers]
 *     summary: Get seller by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller details
 *       404:
 *         description: Seller not found
 */
router.get("/:id", sellerController.getSellerById);

/**
 * @swagger
 * /api/sellers/user:
 *   get:
 *     tags: [Sellers]
 *     summary: Get seller by user ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seller profile not found
 */
router.get("/user", sellerController.getSellerByUserId);

/**
 * @swagger
 * /api/sellers:
 *   get:
 *     tags: [Sellers]
 *     summary: Get all sellers
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
 *         description: List of sellers
 */
router.get("/", sellerController.getAllSellers);

/**
 * @swagger
 * /api/sellers/{id}:
 *   put:
 *     tags: [Sellers]
 *     summary: Update seller profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               businessName:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seller not found
 */
router.put("/:id", sellerController.updateSellerProfile);

/**
 * @swagger
 * /api/sellers/{id}:
 *   delete:
 *     tags: [Sellers]
 *     summary: Delete seller profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seller not found
 */
router.delete("/:id", sellerController.deleteSellerProfile);

/**
 * @swagger
 * /api/sellers/{id}/verify:
 *   post:
 *     tags: [Sellers]
 *     summary: Verify seller
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller verified successfully
 *       404:
 *         description: Seller not found
 */
router.post("/:id/verify", sellerController.verifySeller);

/**
 * @swagger
 * /api/sellers/{sellerId}/products:
 *   get:
 *     tags: [Sellers]
 *     summary: Get seller's products
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of seller's products
 *       404:
 *         description: Seller not found
 */
router.get("/:sellerId/products", sellerController.getSellerProducts);

/**
 * @swagger
 * /api/sellers/{sellerId}/stats:
 *   get:
 *     tags: [Sellers]
 *     summary: Get seller statistics
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller statistics
 *       404:
 *         description: Seller not found
 */
router.get("/:sellerId/stats", sellerController.getSellerStats);

export default router;
