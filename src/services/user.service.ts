import { prisma } from "@/config/database";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

export class UserService {
    // Get user profile
    async getUserProfile(userId: string): Promise<Omit<User, "password">> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                addresses: true,
                sellerProfile: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

    //Upadate user profile
    async updateUserProfile(
        userId: string,
        data: {
            firstName?: string;
            lastName?: string;
            phoneNumber?: string | null;
            notificationPreferences?: {
                emailNotifications?: boolean;
                smsNotifications?: boolean;
                orderUpdates?: boolean;
                promotions?: boolean;
            };
        }
    ): Promise<Omit<User, "password">> {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            throw new Error("User not found");
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data,
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Add address
    async addAddress(
        userId: string,
        addressData: {
            street?: string;
            city?: string;
            state?: string;
            country?: string;
            postalCode?: string;
            isDefault?: boolean;
        }
    ) {
        return prisma.$transaction(async (tx) => {
            // If this is a default address, update all other addresses to non-default
            if (addressData.isDefault) {
                await tx.address.updateMany({
                    where: { userId },
                    data: { isDefault: false },
                });
            }

            // Create the new address
            return tx.address.create({
                data: {
                    ...addressData,
                    userId,
                },
            });
        });
    }

    // Get user address
    async getUserAddress(userId: string) {
        return prisma.address.findMany({
            where: { userId },
        });
    }

    // Update address
    async updateAddress(
        userId: string,
        addressId: string,
        data: {
            street?: string;
            city?: string;
            state?: string;
            country?: string;
            postalCode?: string;
            isDefault?: boolean;
        }
    ) {
        return prisma.$transaction(async (tx) => {
            if (data.isDefault) {
                await tx.address.updateMany({
                    where: { userId },
                    data: { isDefault: false },
                });
            }
            return tx.address.update({
                where: { id: addressId, userId },
                data,
            });
        });
    }

    // Delete address
    async deleteAddress(userId: string, addressId: string) {
        return prisma.address.delete({
            where: { id: addressId, userId },
        });
    }

    // Set default address
    async setDefaultAddress(userId: string, addressId: string) {
        return prisma.$transaction(async (tx) => {
            await tx.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
            return tx.address.update({
                where: { id: addressId, userId },
                data: { isDefault: true },
            });
        });
    }

    // Change password
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const isValidPassword = await bcrypt.compare(
            currentPassword,
            user.password
        );
        if (!isValidPassword) {
            throw new Error("Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    // Delete account
    async deleteAccount(userId: string) {
        return prisma.user.delete({
            where: { id: userId },
        });
    }

    // Update email
    async updateEmail(userId: string, newEmail: string) {
        const existingUser = await prisma.user.findUnique({
            where: { email: newEmail },
        });

        if (existingUser) {
            throw new Error("Email already in use");
        }

        return prisma.user.update({
            where: { id: userId },
            data: {
                email: newEmail,
                isVerified: false, // Require re-verification
            },
        });
    }

    // Update notification preferences
    async updateNotificationPreferences(
        userId: string,
        preferences: {
            emailNotifications?: boolean;
            smsNotifications?: boolean;
            orderUpdates?: boolean;
            promotions?: boolean;
        }
    ) {
        return prisma.user.update({
            where: { id: userId },
            data: { notificationPreferences: preferences },
        });
    }

    // Get user statistics
    async getUserStatistics(userId: string) {
        const [totalOrders, totalReviews, totalSpent] = await Promise.all([
            prisma.order.count({ where: { userId } }),
            prisma.review.count({ where: { userId } }),
            prisma.order.aggregate({
                where: {
                    userId,
                    status: "DELIVERED",
                },
                _sum: { totalAmount: true },
            }),
        ]);

        return {
            totalOrders,
            totalReviews,
            totalSpent: totalSpent._sum.totalAmount || 0,
        };
    }

    // Create/Update seller profile
    async updateSellerProfile(
        userId: string,
        data: {
            businessName: string;
            description?: string;
            logo?: string;
        }
    ) {
        return prisma.seller.upsert({
            where: { userId },
            create: {
                ...data,
                userId,
            },
            update: data,
        });
    }

    // Get seller profile
    async getSellerProfile(userId: string) {
        return prisma.seller.findUnique({
            where: { userId },
            include: {
                products: true,
            },
        });
    }

    // Add to wishlist
    async addToWishlist(userId: string, productId: string) {
        return prisma.wishlist.create({
            data: { userId, productId },
        });
    }

    // Remove from wishlist
    async removeFromWishlist(userId: string, productId: string) {
        return prisma.wishlist.delete({
            where: { userId_productId: { userId, productId } },
        });
    }

    // Get wishlist
    async getWishlist(userId: string) {
        return prisma.wishlist.findMany({
            where: { userId },
            include: { product: true },
        });
    }

    // Verify user account
    async verifyUser(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { isVerified: true },
        });
    }

    // Request verification
    async requestVerification(userId: string) {
        // Implementation would depend on your verification process
        // Could involve sending verification email, SMS, etc.
    }

    // Get user activity
    async getUserActivity(userId: string) {
        const [orders, reviews, refunds] = await Promise.all([
            prisma.order.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.review.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.refundRequest.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
        ]);

        return {
            recentOrders: orders,
            recentReviews: reviews,
            recentRefunds: refunds,
        };
    }

    // Update user settings
    async updateUserSettings(
        userId: string,
        settings: {
            language?: string;
            currency?: string;
            theme?: "light" | "dark";
            timezone?: string;
        }
    ) {
        return prisma.user.update({
            where: { id: userId },
            data: { settings },
        });
    }

    async getUserBehaviorAnalytics(userId: string) {
        const [lastLogin, wishlistCount, cartItems, searchHistory] =
            await Promise.all([
                prisma.user.findUnique({
                    where: { id: userId },
                    select: { lastLogin: true },
                }),
                prisma.wishlist.count({ where: { userId } }),
                prisma.cart.count({ where: { userId } }),
                prisma.searchHistory.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                }),
            ]);

        return {
            lastLogin: lastLogin?.lastLogin,
            wishlistCount,
            cartItems,
            recentSearches: searchHistory,
        };
    }
}
