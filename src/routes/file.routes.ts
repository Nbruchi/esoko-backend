import { Router } from "express";
import { FileController } from "@/controllers/file.controller";
import multer from "multer";

const router = Router();
const fileController = new FileController();
const upload = multer();

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload a single file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - folder
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/upload", upload.single("file"), fileController.uploadFile);

/**
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     tags: [Files]
 *     summary: Upload multiple files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *               - folder
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: No files uploaded or invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/upload-multiple",
    upload.array("files"),
    fileController.uploadMultipleFiles
);

/**
 * @swagger
 * /api/files/{publicId}:
 *   delete:
 *     tags: [Files]
 *     summary: Delete a file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Invalid public ID
 *       401:
 *         description: Unauthorized
 */
router.delete("/:publicId", fileController.deleteFile);

/**
 * @swagger
 * /api/files/delete-multiple:
 *   delete:
 *     tags: [Files]
 *     summary: Delete multiple files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicIds
 *             properties:
 *               publicIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Files deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.delete("/delete-multiple", fileController.deleteMultipleFiles);

/**
 * @swagger
 * /api/files/update:
 *   put:
 *     tags: [Files]
 *     summary: Update a file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - oldPublicId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               oldPublicId:
 *                 type: string
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: File updated successfully
 *       400:
 *         description: No file uploaded or invalid input
 *       401:
 *         description: Unauthorized
 */
router.put("/update", upload.single("file"), fileController.updateFile);

/**
 * @swagger
 * /api/files/{publicId}/transform:
 *   post:
 *     tags: [Files]
 *     summary: Transform an image
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
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
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *               crop:
 *                 type: string
 *               format:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image transformed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/:publicId/transform", fileController.transformImage);

/**
 * @swagger
 * /api/files/{publicId}:
 *   get:
 *     tags: [Files]
 *     summary: Get file details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File details retrieved successfully
 *       400:
 *         description: Invalid public ID
 *       401:
 *         description: Unauthorized
 */
router.get("/:publicId", fileController.getFileDetails);

/**
 * @swagger
 * /api/files/folder/{folder}:
 *   get:
 *     tags: [Files]
 *     summary: List files in a folder
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folder
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Files listed successfully
 *       400:
 *         description: Invalid folder
 *       401:
 *         description: Unauthorized
 */
router.get("/folder/:folder", fileController.listFiles);

/**
 * @swagger
 * /api/files/upload-category:
 *   post:
 *     tags: [Files]
 *     summary: Upload file with category-specific transformations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - category
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *                 enum: [profile, product, category, seller, blog]
 *               folder:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or invalid category
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/upload-category",
    upload.single("file"),
    fileController.uploadWithCategory
);

/**
 * @swagger
 * /api/files/upload-product-images:
 *   post:
 *     tags: [Files]
 *     summary: Upload product images with multiple sizes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *               - folder
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product images uploaded successfully
 *       400:
 *         description: No files uploaded or invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/upload-product-images",
    upload.array("files"),
    fileController.uploadProductImages
);

/**
 * @swagger
 * /api/files/update-category:
 *   put:
 *     tags: [Files]
 *     summary: Update file with category-specific transformations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - oldPublicId
 *               - category
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               oldPublicId:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [profile, product, category, seller, blog]
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: File updated successfully
 *       400:
 *         description: No file uploaded or invalid category
 *       401:
 *         description: Unauthorized
 */
router.put(
    "/update-category",
    upload.single("file"),
    fileController.updateWithCategory
);

/**
 * @swagger
 * /api/files/{publicId}/signed-url:
 *   get:
 *     tags: [Files]
 *     summary: Generate signed URL for private files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           description: URL expiration time in seconds
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signedUrl:
 *                   type: string
 *       400:
 *         description: Invalid public ID
 *       401:
 *         description: Unauthorized
 */
router.get("/:publicId/signed-url", fileController.generateSignedUrl);

export default router;
