import { Request, Response } from "express";
import { ProductService } from "@/services/product.service";

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    // Create product
    async createProduct(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Seller not authenticated" });
            }
            const product = await this.productService.createProduct({
                ...req.body,
                sellerId,
            });
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get product by ID
    async getProductById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await this.productService.getProductById(id);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.json(product);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get all products
    async getProducts(req: Request, res: Response) {
        try {
            const { page, limit, categoryId, search, minPrice, maxPrice } =
                req.query;
            const products = await this.productService.getProducts({
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                categoryId: categoryId as string,
                search: search as string,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
            });
            res.json(products);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update product
    async updateProduct(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Seller not authenticated" });
            }
            const { id } = req.params;
            const product = await this.productService.updateProduct(
                id,
                sellerId,
                req.body
            );
            res.json(product);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Soft delete product
    async softDeleteProduct(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Seller not authenticated" });
            }
            const { id } = req.params;
            const product = await this.productService.softDeleteProduct(
                id,
                sellerId
            );
            res.json(product);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get seller products
    async getSellerProducts(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Seller not authenticated" });
            }
            const { page, limit } = req.query;
            const products = await this.productService.getSellerProducts(
                sellerId,
                {
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                }
            );
            res.json(products);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get product reviews
    async getProductReviews(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const { page, limit } = req.query;
            const reviews = await this.productService.getProductReviews(
                productId,
                {
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                }
            );
            res.json(reviews);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Add product review
    async addProductReview(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { productId } = req.params;
            const { rating, comment } = req.body;
            const review = await this.productService.addProductReview({
                userId,
                productId,
                rating,
                comment,
            });
            res.status(201).json(review);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get product statistics
    async getProductStatistics(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const stats =
                await this.productService.getProductStatistics(productId);
            res.json(stats);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get seller's product statistics
    async getSellerProductStatistics(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Seller not authenticated" });
            }
            const stats =
                await this.productService.getSellerProductStatistics(sellerId);
            res.json(stats);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Bulk update products
    async bulkUpdateProducts(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Seller not authenticated" });
            }
            const { productIds, data } = req.body;
            const count = await this.productService.bulkUpdateProducts(
                sellerId,
                productIds,
                data
            );
            res.json({ count });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Search products
    async searchProduct(req: Request, res: Response) {
        try {
            const {
                search,
                categoryId,
                minPrice,
                maxPrice,
                inStock,
                rating,
                sortBy,
                sortOrder,
                page,
                limit,
            } = req.query;
            const products = await this.productService.searchProduct({
                search: search as string,
                categoryId: categoryId as string,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                inStock: inStock === "true",
                rating: rating ? Number(rating) : undefined,
                sortBy: sortBy as "price" | "rating" | "createdAt",
                sortOrder: sortOrder as "asc" | "desc",
                page: Number(page) || 1,
                limit: Number(limit) || 10,
            });
            res.json(products);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get products by category
    async getProductsByCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const { page, limit } = req.query;
            const products = await this.productService.getProductsByCategory(
                categoryId,
                {
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                }
            );
            res.json(products);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update product stock
    async updateProductStock(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Seller not authenticated" });
            }
            const { id } = req.params;
            const { quantity } = req.body;
            const product = await this.productService.updateProductStock(
                id,
                sellerId,
                quantity
            );
            res.json(product);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Check product availability
    async checkProductAvailability(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { quantity } = req.query;
            const available =
                await this.productService.checkProductAvailability(
                    id,
                    Number(quantity)
                );
            res.json({ available });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get product performance metrics
    async getProductPerformanceMetrics(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const { timeRange } = req.query;
            if (
                !timeRange ||
                !["day", "week", "month", "year"].includes(timeRange as string)
            ) {
                return res.status(400).json({
                    message:
                        "Valid time range (day/week/month/year) is required",
                });
            }
            const metrics =
                await this.productService.getProductPerformanceMetrics(
                    productId,
                    timeRange as "day" | "week" | "month" | "year"
                );
            res.json(metrics);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get related products
    async getRelatedProducts(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const { limit } = req.query;
            const products = await this.productService.getRelatedProducts(
                productId,
                limit ? Number(limit) : undefined
            );
            res.json(products);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get inventory analytics
    async getInventoryAnalytics(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Seller not authenticated" });
            }
            const analytics =
                await this.productService.getInventoryAnalytics(sellerId);
            res.json(analytics);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
