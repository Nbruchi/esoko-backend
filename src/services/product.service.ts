import { prisma } from "@/config/database";
import { OrderStatus, Product } from "@prisma/client";
import { paginate, PaginationParams } from "@/utils/pagination";

export class ProductService {
    // Create product
    async createProduct(data: {
        name: string;
        description: string;
        price: number;
        stock: number;
        categoryId: string;
        sellerId: string;
        images: string[];
    }): Promise<Product> {
        // Check if seller exists and is verified
        const seller = await prisma.seller.findUnique({
            where: { id: data.sellerId },
        });
        if (!seller) {
            throw new Error("Seller not found");
        }
        if (!seller.isVerified) {
            throw new Error("Seller is not verified");
        }
        return prisma.product.create({ data });
    }

    // Get product by id
    async getProductById(id: string): Promise<Product> {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                seller: true,
                reviews: true,
            },
        });
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    }

    // Get all products with pagination and filters
    async getProducts(params: {
        page?: number;
        limit?: number;
        categoryId?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
    }) {
        const { categoryId, search, minPrice, maxPrice } = params;

        // Build where clause
        const where: any = {};
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) {
                where.price.gte = minPrice;
            }
            if (maxPrice) {
                where.price.lte = maxPrice;
            }
        }

        return paginate(
            (skip, take) =>
                prisma.product.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        category: true,
                        seller: true,
                    },
                    orderBy: { createdAt: "desc" },
                }),
            () => prisma.product.count({ where }),
            params
        );
    }

    // Update product
    async updateProduct(
        id: string,
        sellerId: string,
        data: {
            name?: string;
            description?: string;
            price?: number;
            stock?: number;
            categoryId?: string;
            images?: string[];
            isActive?: boolean;
        }
    ): Promise<Product> {
        const product = await prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new Error("Product not found");
        }
        return prisma.product.update({
            where: {
                id,
                sellerId,
            },
            data,
        });
    }

    // Soft delete product
    async softDeleteProduct(id: string, sellerId: string): Promise<Product> {
        const product = await prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new Error("Product not found");
        }
        return prisma.product.update({
            where: {
                id,
                sellerId,
            },
            data: { isActive: false },
        });
    }

    // Get seller products
    async getSellerProducts(sellerId: string, params: PaginationParams) {
        return paginate(
            (skip, take) =>
                prisma.product.findMany({
                    where: { sellerId, isActive: true },
                    skip,
                    take,
                    include: {
                        category: true,
                        reviews: true,
                    },
                    orderBy: { createdAt: "desc" },
                }),
            () =>
                prisma.product.count({
                    where: {
                        sellerId,
                        isActive: true,
                    },
                }),
            params
        );
    }

    // Get product reviews
    async getProductReviews(productId: string, params: PaginationParams = {}) {
        return paginate(
            (skip, take) =>
                prisma.review.findMany({
                    where: { productId },
                    skip,
                    take,
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                }),
            () => prisma.review.count({ where: { productId } }),
            params
        );
    }

    // Add product review
    async addProductReview(data: {
        userId: string;
        productId: string;
        rating: number;
        comment?: string;
    }) {
        return prisma.review.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    // Get product statistics
    async getProductStatistics(productId: string) {
        const [totalReviews, averageRating, totalSold] = await Promise.all([
            prisma.review.count({ where: { productId } }),
            prisma.review.aggregate({
                where: { productId },
                _avg: { rating: true },
            }),
            prisma.orderItem.aggregate({
                where: { productId },
                _sum: { quantity: true },
            }),
        ]);

        return {
            totalReviews,
            averageRating: averageRating._avg.rating || 0,
            totalSold: totalSold._sum.quantity || 0,
        };
    }

    // Get seller's product statistics
    async getSellerProductStatistics(sellerId: string) {
        const [totalProducts, activeProducts, totalSold, totalRevenue] =
            await Promise.all([
                prisma.product.count({ where: { sellerId } }),
                prisma.product.count({ where: { sellerId, isActive: true } }),
                prisma.orderItem.aggregate({
                    where: {
                        product: { sellerId },
                        order: { status: OrderStatus.DELIVERED },
                    },
                    _sum: { quantity: true },
                }),
                prisma.orderItem.aggregate({
                    where: {
                        product: { sellerId },
                        order: { status: OrderStatus.DELIVERED },
                    },
                    _sum: { price: true },
                }),
            ]);

        return {
            totalProducts,
            activeProducts,
            totalSold: totalSold._sum.quantity || 0,
            totalRevenue: totalRevenue._sum.price || 0,
        };
    }

    // Bulk update products (e.g: for price changes)
    async bulkUpdateProducts(
        sellerId: string,
        productIds: string[],
        data: {
            price?: number;
            stock?: number;
            isActive?: boolean;
        }
    ): Promise<number> {
        const result = await prisma.product.updateMany({
            where: {
                id: { in: productIds },
                sellerId,
            },
            data,
        });
        return result.count;
    }

    async searchProduct(
        params: {
            search?: string;
            categoryId?: string;
            minPrice?: number;
            maxPrice?: number;
            inStock?: boolean;
            rating?: number;
            sortBy?: "price" | "rating" | "createdAt";
            sortOrder?: "asc" | "desc";
        } & PaginationParams
    ) {
        const {
            search,
            categoryId,
            minPrice,
            maxPrice,
            inStock,
            rating,
            sortBy,
            sortOrder,
            ...paginationParams
        } = params;

        const where: any = { isActive: true };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        if (categoryId) where.categoryId = categoryId;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = minPrice;
            if (maxPrice) where.price.lte = maxPrice;
        }
        if (inStock) where.stock = { gt: 0 };
        if (rating) {
            where.reviews = {
                some: {
                    rating: { gte: rating },
                },
            };
        }

        const orderBy: any = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || "desc";
        } else {
            orderBy.createdAt = "desc";
        }

        return paginate(
            (skip, take) =>
                prisma.product.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        category: true,
                        seller: true,
                        reviews: true,
                    },
                    orderBy,
                }),
            () => prisma.product.count({ where }),
            paginationParams
        );
    }

    // Get products by category with subcategories
    async getProductsByCategory(categoryId: string, params: PaginationParams) {
        return paginate(
            (skip, take) =>
                prisma.product.findMany({
                    where: {
                        categoryId,
                        isActive: true,
                    },
                    skip,
                    take,
                    include: {
                        category: true,
                        seller: true,
                        reviews: true,
                    },
                    orderBy: { createdAt: "desc" },
                }),
            () =>
                prisma.product.count({ where: { categoryId, isActive: true } }),
            params
        );
    }

    // Update product stock
    async updateProductStock(
        id: string,
        sellerId: string,
        quantity: number
    ): Promise<Product> {
        return prisma.product.update({
            where: { id, sellerId },
            data: {
                stock: {
                    increment: quantity,
                },
            },
        });
    }

    // Check product availability
    async checkProductAvailability(
        id: string,
        quantity: number
    ): Promise<boolean> {
        const product = await prisma.product.findUnique({
            where: { id },
            select: { stock: true, isActive: true },
        });

        return (
            (product?.isActive ?? false) && (product?.stock ?? 0) >= quantity
        );
    }

    // Get product performance metrics
    async getProductPerformanceMetrics(
        productId: string,
        timeRange: "day" | "week" | "month" | "year"
    ) {
        const startDate = new Date();
        switch (timeRange) {
            case "day":
                startDate.setDate(startDate.getDate() - 1);
                break;
            case "week":
                startDate.setDate(startDate.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case "year":
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        const [orders, revenue, averageRating] = await Promise.all([
            prisma.orderItem.count({
                where: {
                    productId,
                    order: {
                        createdAt: { gte: startDate },
                        status: OrderStatus.DELIVERED,
                    },
                },
            }),
            prisma.orderItem.aggregate({
                where: {
                    productId,
                    order: {
                        createdAt: { gte: startDate },
                        status: OrderStatus.DELIVERED,
                    },
                },
                _sum: { price: true },
            }),
            prisma.review.aggregate({
                where: {
                    productId,
                    createdAt: { gte: startDate },
                },
                _avg: { rating: true },
            }),
        ]);

        return {
            orders,
            revenue: revenue._sum.price || 0,
            averageRating: averageRating._avg.rating || 0,
        };
    }

    // Get recommended products
    async getRelatedProducts(productId: string, limit: number = 4) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { categoryId: true },
        });

        if (!product) return [];

        return prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: productId },
                isActive: true,
            },
            take: limit,
            include: {
                category: true,
                reviews: true,
            },
        });
    }

    async getInventoryAnalytics(sellerId: string) {
        const [lowStock, fastMoving, slowMoving] = await Promise.all([
            prisma.product.findMany({
                where: {
                    sellerId,
                    stock: { lte: 10 },
                    isActive: true,
                },
            }),
            prisma.product.findMany({
                where: {
                    sellerId,
                    isActive: true,
                },
                orderBy: {
                    orderItems: {
                        _count: "desc",
                    },
                },
                take: 5,
            }),
            prisma.product.findMany({
                where: {
                    sellerId,
                    isActive: true,
                    orderItems: {
                        none: {},
                    },
                },
            }),
        ]);

        return {
            lowStock,
            fastMoving,
            slowMoving,
        };
    }
}
