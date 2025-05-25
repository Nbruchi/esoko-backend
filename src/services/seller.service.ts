import { prisma } from "@/config/database";
import { Seller } from "@prisma/client";

export class SellerService {
    // Create seller profile
    async createSellerProfile(data: {
        userId: string;
        businessName: string;
        description?: string;
        logo?: string;
    }): Promise<Seller> {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: data.userId },
        });
        if (!user) {
            throw new Error("User not found");
        }

        // Check if user already has a seller profile
        const existing = await prisma.seller.findUnique({
            where: { userId: data.userId },
        });
        if (existing) {
            throw new Error("Seller profile already exists for this user.");
        }
        return prisma.seller.create({ data });
    }

    // Get seller profile by seller id
    async getSellerById(id: string): Promise<Seller> {
        const seller = await prisma.seller.findUnique({ where: { id } });
        if (!seller) {
            throw new Error("Seller not found");
        }
        return seller;
    }

    // Get seller profile by user id
    async getSellerByUserId(userId: string): Promise<Seller | null> {
        return prisma.seller.findUnique({ where: { userId } });
    }

    // Get all sellers (with optional pagination)
    async getAllSellers(params?: { skip?: number; take?: number }) {
        return prisma.seller.findMany({
            skip: params?.skip,
            take: params?.take,
            orderBy: { createdAt: "desc" },
        });
    }

    // Update seller profile
    async updateSellerProfile(
        id: string,
        data: {
            businessName?: string;
            description?: string;
            logo?: string;
        }
    ): Promise<Seller> {
        const seller = await prisma.seller.findUnique({ where: { id } });
        if (!seller) {
            throw new Error("Seller not found");
        }
        return prisma.seller.update({
            where: { id },
            data,
        });
    }

    // Delete seller profile
    async deleteSellerProfile(id: string): Promise<void> {
        const seller = await prisma.seller.findUnique({ where: { id } });
        if (!seller) {
            throw new Error("Seller not found");
        }
        await prisma.seller.delete({ where: { id } });
    }

    // Verify seller
    async verifySeller(id: string): Promise<Seller> {
        const seller = await prisma.seller.findUnique({ where: { id } });
        if (!seller) {
            throw new Error("Seller not found");
        }
        return prisma.seller.update({
            where: { id },
            data: { isVerified: true },
        });
    }

    // Get seller's products
    async getSellerProducts(sellerId: string) {
        return prisma.product.findMany({
            where: { sellerId },
            orderBy: { createdAt: "desc" },
        });
    }

    // Get seller analytics/statistics
    async getSellerStats(sellerId: string) {
        // Get all products for the seller
        const products = await prisma.product.findMany({
            where: { sellerId },
            include: {
                orderItems: {
                    include: {
                        order: true,
                    },
                },
                reviews: true,
            },
        });

        const productCount = products.length;

        // Total sales: sum of quantities in completed/delivered orders
        let totalSales = 0;
        let totalRating = 0;
        let totalReviews = 0;

        for (const product of products) {
            for (const item of product.orderItems) {
                if (
                    item.order.paymentStatus === "COMPLETED" ||
                    item.order.status === "DELIVERED"
                ) {
                    totalSales += item.quantity;
                }
            }
            for (const review of product.reviews) {
                totalRating += review.rating;
                totalReviews += 1;
            }
        }

        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        return {
            productCount,
            totalSales,
            averageRating,
        };
    }
}
