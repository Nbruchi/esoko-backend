import { prisma } from "@/config/database";

export class CartService {
    //Add item to cart
    async addCart(userId: string, productId: string, quantity: number) {
        return prisma.cart.upsert({
            where: {
                userId_productId: { userId, productId },
            },
            update: {
                quantity: { increment: quantity },
            },
            create: {
                userId,
                productId,
                quantity,
            },
            include: {
                product: true,
            },
        });
    }

    //Update cart item quantity
    async updateCartItem(userId: string, productId: string, quantity: number) {
        if (quantity <= 0) {
            return this.removeFromCart(userId, productId);
        }

        return prisma.cart.update({
            where: {
                userId_productId: { userId, productId },
            },
            data: { quantity },
            include: {
                product: true,
            },
        });
    }

    //Remove item from cart
    async removeFromCart(userId: string, productId: string) {
        return prisma.cart.delete({
            where: {
                userId_productId: { userId, productId },
            },
        });
    }

    // Get user's cart
    async getCart(userId: string) {
        return prisma.cart.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        category: true,
                        seller: true,
                    },
                },
            },
        });
    }

    //Clear cart
    async clearCart(userId: string) {
        return prisma.cart.deleteMany({
            where: { userId },
        });
    }

    // Get cart total
    async getCartTotal(userId: string) {
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: { product: true },
        });

        return cartItems.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);
    }

    //Validate cart items
    async validateCart(userId: string) {
        const cartItems = await this.getCart(userId);
        const validationResults = [];

        for (const item of cartItems) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product || !product.isActive) {
                validationResults.push({
                    productId: item.productId,
                    valid: false,
                    reason: "Product not available",
                });
            } else if (product.stock < item.quantity) {
                validationResults.push({
                    productId: item.productId,
                    valid: false,
                    reason: "Insufficient stock",
                });
            } else {
                validationResults.push({
                    productId: item.productId,
                    valid: true,
                });
            }
        }
        return validationResults;
    }
}
