import { Request, Response } from "express";
import { FileService, FileCategory } from "@/services/file.service";

const VALID_CATEGORIES = [
    "profile",
    "product",
    "category",
    "seller",
    "blog",
] as const;

export class FileController {
    private fileService: FileService;

    constructor() {
        this.fileService = new FileService();
    }

    // Upload single file
    async uploadFile(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const { folder } = req.body;
            const result = await this.fileService.uploadFile(req.file, folder);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Upload multiple files
    async uploadMultipleFiles(req: Request, res: Response) {
        try {
            if (!req.files || !Array.isArray(req.files)) {
                return res.status(400).json({ message: "No files uploaded" });
            }
            const { folder } = req.body;
            const results = await this.fileService.uploadMultipleFiles(
                req.files,
                folder
            );
            res.status(201).json(results);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Delete file
    async deleteFile(req: Request, res: Response) {
        try {
            const { publicId } = req.params;
            await this.fileService.deleteFile(publicId);
            res.json({ message: "File deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Delete multiple files
    async deleteMultipleFiles(req: Request, res: Response) {
        try {
            const { publicIds } = req.body;
            if (!Array.isArray(publicIds)) {
                return res
                    .status(400)
                    .json({ message: "publicIds must be an array" });
            }
            await this.fileService.deleteMultipleFiles(publicIds);
            res.json({ message: "Files deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update file
    async updateFile(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const { oldPublicId, folder } = req.body;
            const result = await this.fileService.updateFile(
                req.file,
                oldPublicId,
                folder
            );
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Transform image
    async transformImage(req: Request, res: Response) {
        try {
            const { publicId } = req.params;
            const transformations = req.body;
            const result = await this.fileService.transformImage(
                publicId,
                transformations
            );
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get file details
    async getFileDetails(req: Request, res: Response) {
        try {
            const { publicId } = req.params;
            const details = await this.fileService.getFileDetails(publicId);
            res.json(details);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // List files in folder
    async listFiles(req: Request, res: Response) {
        try {
            const { folder } = req.params;
            const files = await this.fileService.listFiles(folder);
            res.json(files);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Upload with category-specific transformations
    async uploadWithCategory(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const { category, folder } = req.body;
            if (!VALID_CATEGORIES.includes(category)) {
                return res.status(400).json({ message: "Invalid category" });
            }
            const result = await this.fileService.uploadWithCategory(
                req.file,
                category,
                folder
            );
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Upload product images with multiple sizes
    async uploadProductImages(req: Request, res: Response) {
        try {
            if (!req.files || !Array.isArray(req.files)) {
                return res.status(400).json({ message: "No files uploaded" });
            }
            const { folder } = req.body;
            const results = await this.fileService.uploadProductImages(
                req.files,
                folder
            );
            res.status(201).json(results);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update file with category-specific transformations
    async updateWithCategory(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const { oldPublicId, category, folder } = req.body;
            if (!VALID_CATEGORIES.includes(category)) {
                return res.status(400).json({ message: "Invalid category" });
            }
            const result = await this.fileService.updateWithCategory(
                req.file,
                oldPublicId,
                category,
                folder
            );
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Generate signed URL for private files
    async generateSignedUrl(req: Request, res: Response) {
        try {
            const { publicId } = req.params;
            const { expiresIn } = req.query;
            const signedUrl = await this.fileService.generateSignedUrl(
                publicId,
                expiresIn ? Number(expiresIn) : undefined
            );
            res.json({ signedUrl });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
