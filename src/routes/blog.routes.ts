import { Router } from "express";
import { BlogController } from "@/controllers/blog.controller";

const router = Router();
const blogController = new BlogController();

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     tags: [Blogs]
 *     summary: Create a new blog post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", blogController.createBlogPost);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     tags: [Blogs]
 *     summary: Get a blog post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *       404:
 *         description: Blog post not found
 */
router.get("/:id", blogController.getBlogPost);

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: Get all blog posts
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
 *       - in: query
 *         name: publishedOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of blog posts
 */
router.get("/", blogController.getBlogPosts);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     tags: [Blogs]
 *     summary: Update a blog post
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */
router.put("/:id", blogController.updateBlogPost);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     tags: [Blogs]
 *     summary: Delete a blog post
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
 *         description: Blog post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */
router.delete("/:id", blogController.deleteBlogPost);

/**
 * @swagger
 * /api/blogs/{id}/publish:
 *   post:
 *     tags: [Blogs]
 *     summary: Publish a blog post
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
 *         description: Blog post published successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */
router.post("/:id/publish", blogController.publishBlogPost);

/**
 * @swagger
 * /api/blogs/{id}/unpublish:
 *   post:
 *     tags: [Blogs]
 *     summary: Unpublish a blog post
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
 *         description: Blog post unpublished successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */
router.post("/:id/unpublish", blogController.unpublishBlogPost);

/**
 * @swagger
 * /api/blogs/analytics:
 *   get:
 *     tags: [Blogs]
 *     summary: Get blog analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/analytics", blogController.getBlogAnalytics);

export default router;
