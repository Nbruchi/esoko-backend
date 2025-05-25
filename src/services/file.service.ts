import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";

export type FileType = "image" | "document";
export type FileCategory =
    | "profile"
    | "product"
    | "category"
    | "seller"
    | "blog";

interface UploadOptions {
    folder: string;
    allowedFormats: string[];
    maxSize: number;
    transformation?: any;
}

// Category-specific transformations
const TRANSFORMATIONS = {
    profile: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
        { quality: "auto" },
        { format: "webp" },
    ],
    product: {
        thumbnail: [
            { width: 150, height: 150, crop: "fill" },
            { quality: "auto" },
            { format: "webp" },
        ],
        listing: [
            { width: 300, height: 300, crop: "fill" },
            { quality: "auto" },
            { format: "webp" },
        ],
        detail: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
            { format: "webp" },
        ],
    },
    category: [
        { width: 400, height: 200, crop: "fill" },
        { quality: "auto" },
        { format: "webp" },
    ],
    seller: [
        { width: 200, height: 200, crop: "fill" },
        { quality: "auto" },
        { format: "webp" },
    ],
    blog: [
        { width: 1200, height: 630, crop: "fill" },
        { quality: "auto" },
        { format: "webp" },
    ],
};

export class FileService {
    private upload: multer.Multer;

    constructor() {
        //Configure multer for memory storage
        this.upload = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024,
                files: 5,
            },
            fileFilter: (req, file, cb) => {
                if (
                    file.mimetype.startsWith("image/") ||
                    file.mimetype === "application/pdf"
                ) {
                    cb(null, true);
                } else {
                    cb(new Error("Invalid file type"));
                }
            },
        });
    }

    //Get multer middleware for specific category
    getUploadMiddleware(category: FileCategory) {
        return this.upload.single(category);
    }

    //Upload single file
    async uploadFile(file: Express.Multer.File, folder: string) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "auto",
                    transformation: [
                        { width: 1000, height: 1000, crop: "limit" },
                        { quality: "auto" },
                        { fetch_format: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            const stream = Readable.from(file.buffer);
            stream.pipe(uploadStream);
        });
    }

    //Upload multiple files
    async uploadMultipleFiles(files: Express.Multer.File[], folder: string) {
        const uploadStream = files.map((file) => this.uploadFile(file, folder));
        return Promise.all(uploadStream);
    }

    // Delete file
    async deleteFile(publicId: string) {
        return cloudinary.uploader.destroy(publicId);
    }

    //Delete multiple files
    async deleteMultipleFiles(publicIds: string[]) {
        const deletePromises = publicIds.map((id) => this.deleteFile(id));
        return Promise.all(deletePromises);
    }

    // Update file
    async updateFile(
        newFile: Express.Multer.File,
        oldPublicId: string,
        folder: string
    ) {
        try {
            if (oldPublicId) {
                await this.deleteFile(oldPublicId);
            }
            return await this.uploadFile(newFile, folder);
        } catch (error: unknown) {
            throw new Error(`Failed to update file ${error}`);
        }
    }

    //Transform image
    async transformImage(
        publicId: string,
        transformations: {
            width?: number;
            height?: number;
            crop?: "fill" | "fit" | "limit" | "thumb" | "scale";
            gravity?: "face" | "center" | "auto";
            quantity?: "auto" | number;
            format?: "jpg" | "png" | "webp" | "gif";
        }
    ) {
        return cloudinary.uploader.explicit(publicId, {
            type: "upload",
            eager: [transformations],
        });
    }

    //Get file details
    async getFileDetails(publicId: string) {
        return cloudinary.api.resource(publicId);
    }

    //List in files in folders
    async listFiles(folder: string) {
        return cloudinary.api.resources({
            type: "upload",
            prefix: folder,
            max_results: 500,
        });
    }

    // Upload with category-specific transformations
    async uploadWithCategory(
        file: Express.Multer.File,
        category: FileCategory,
        folder: string
    ) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "auto",
                    transformation: TRANSFORMATIONS[category],
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            const stream = Readable.from(file.buffer);
            stream.pipe(uploadStream);
        });
    }

    // Upload product images with multiple sizes
    async uploadProductImages(files: Express.Multer.File[], folder: string) {
        const uploadPromises = files.map(async (file) => {
            const thumbnail = (await this.uploadWithCategory(
                file,
                "product",
                `${folder}/thumbnails`
            )) as { secure_url: string };
            const listing = (await this.uploadWithCategory(
                file,
                "product",
                `${folder}/listing`
            )) as { secure_url: string };
            const detail = (await this.uploadWithCategory(
                file,
                "product",
                `${folder}/detail`
            )) as { secure_url: string };

            return {
                thumbnail: thumbnail.secure_url,
                listing: listing.secure_url,
                detail: detail.secure_url,
            };
        });

        return Promise.all(uploadPromises);
    }

    // Update file with category-specific transformations
    async updateWithCategory(
        newFile: Express.Multer.File,
        oldPublicId: string,
        category: FileCategory,
        folder: string
    ) {
        try {
            if (oldPublicId) {
                await this.deleteFile(oldPublicId);
            }
            return await this.uploadWithCategory(newFile, category, folder);
        } catch (error: unknown) {
            throw new Error(`Failed to update file: ${error}`);
        }
    }

    // Generate signed URL for private files
    async generateSignedUrl(publicId: string, expiresIn: number = 3600) {
        return cloudinary.utils.sign_request({
            public_id: publicId,
            timestamp: Math.round(Date.now() / 1000),
            expires_at: Math.round(Date.now() / 1000) + expiresIn,
        });
    }
}
