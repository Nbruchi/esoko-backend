import { Router } from "express";
import { CategoryController } from "@/controllers/category.controller";

const router = Router();
const categoryController = new CategoryController();

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 */
router.post("/", categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get("/:id", categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.put("/:id", categoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
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
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.delete("/:id", categoryController.deleteCategory);

/**
 * @swagger
 * /api/categories/parents:
 *   get:
 *     tags: [Categories]
 *     summary: Get parent categories
 *     responses:
 *       200:
 *         description: List of parent categories
 */
router.get("/parents", categoryController.getParentCategories);

/**
 * @swagger
 * /api/categories/{parentId}/subcategories:
 *   get:
 *     tags: [Categories]
 *     summary: Get subcategories
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subcategories
 *       404:
 *         description: Parent category not found
 */
router.get("/:parentId/subcategories", categoryController.getSubcategories);

/**
 * @swagger
 * /api/categories/tree:
 *   get:
 *     tags: [Categories]
 *     summary: Get category tree
 *     responses:
 *       200:
 *         description: Category tree structure
 */
router.get("/tree", categoryController.getCategoryTree);

/**
 * @swagger
 * /api/categories/{id}/products:
 *   get:
 *     tags: [Categories]
 *     summary: Get products in category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: List of products in category
 *       404:
 *         description: Category not found
 */
router.get("/:id/products", categoryController.getCategoryProducts);

/**
 * @swagger
 * /api/categories/search:
 *   get:
 *     tags: [Categories]
 *     summary: Search categories
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching categories
 *       400:
 *         description: Search query is required
 */
router.get("/search", categoryController.searchCategories);

export default router;
