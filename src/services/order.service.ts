import { paginate, PaginationParams } from "./../utils/pagination";
import { prisma } from "@/config/database";
import { stripe } from "@/config/stripe";
import {
    Order,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from "@prisma/client";

export class OrderService {
    // Create a new order
    async createOrder(data: {
        userId: string;
        addressId: string;
        items: Array<{ productId: string; quantity: number }>;
        paymentMethod: PaymentMethod;
    }): Promise<Order> {
        return prisma.$transaction(async (tx) => {
            // 1. Calculate total amount and validate products
            let totalAmount = 0;
            const orderItems = [];

            for (const item of data.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(
                        `Insufficient stock for product ${product.name}`
                    );
                }

                // Calculate item total
                const itemsTotal = product.price * item.quantity;
                totalAmount += itemsTotal;

                // Create order Item
                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                });

                // Update product stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: product.stock - item.quantity },
                });
            }

            // 2. Create payment inte if using stripe
            let paymentIntentId = null;
            if (data.paymentMethod === "STRIPE") {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(totalAmount * 100),
                    currency: "rwf",
                });
                paymentIntentId = paymentIntent.id;
            }

            // 3. Create the order
            const order = await tx.order.create({
                data: {
                    userId: data.userId,
                    addressId: data.addressId,
                    totalAmount,
                    paymentMethod: data.paymentMethod,
                    paymentStatus: PaymentStatus.PENDING,
                    status: OrderStatus.PENDING,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            return order;
        });
    }

    // Get order by id
    async getOrderById(orderId: string, userId: string): Promise<Order | null> {
        return prisma.order.findFirst({
            where: {
                id: orderId,
                userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                address: true,
            },
        });
    }

    // Get user orders with pagination
    async getUserOrders(userId: string, params: PaginationParams = {}) {
        return paginate(
            // Find many function
            (skip, take) =>
                prisma.order.findMany({
                    where: { userId },
                    skip,
                    take,
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                }),
            // Count functio
            () => prisma.order.count({ where: { userId } })
        );
    }

    //Update order status
    async updateOrderStatus(
        orderId: string,
        status: OrderStatus
    ): Promise<Order> {
        return prisma.order.update({
            where: {
                id: orderId,
            },
            data: { status },
        });
    }

    // Update payment status
    async updatePaymentStatus(
        orderId: string,
        status: PaymentStatus
    ): Promise<Order> {
        return prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: status },
        });
    }

    //Cancel order
    async cancelOrder(orderId: string, userId: string): Promise<Order> {
        return prisma.$transaction(async (tx) => {
            //Get order
            const order = await tx.order.findFirst({
                where: {
                    id: orderId,
                    userId,
                    status: OrderStatus.PENDING,
                },
                include: {
                    items: true,
                },
            });

            if (!order) {
                throw new Error(`Order not found or cannot be cancelled`);
            }

            //Restore product stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }

            //Update order status
            return tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.CANCELLED },
            });
        });
    }

    //Get orders by status
    async getOrdersByStatus(
        status: OrderStatus,
        params: PaginationParams = {}
    ) {
        return paginate(
            (skip, take) =>
                prisma.order.findMany({
                    where: { status },
                    skip,
                    take,
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                }),
            () => prisma.order.count({ where: { status } })
        );
    }

    //Get orders by date range
    async getOrdersByDateRange(
        startDate: Date,
        endDate: Date,
        params: PaginationParams = {}
    ) {
        return paginate(
            (skip, take) =>
                prisma.order.findMany({
                    where: {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    skip,
                    take,
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                }),
            () =>
                prisma.order.count({
                    where: {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                }),
            params
        );
    }

    // Get order statistics
    async getOrderStatistics() {
        const [
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: OrderStatus.PENDING } }),
            prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
            prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
            prisma.order.aggregate({
                where: { status: OrderStatus.DELIVERED },
                _sum: { totalAmount: true },
            }),
        ]);

        return {
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
        };
    }

    // Get user order statistics
    async getUserOrderStatistics(userId: string) {
        const [totalOrders, pendingOrders, completedOrders, totalSpent] =
            await Promise.all([
                prisma.order.count({ where: { userId } }),
                prisma.order.count({
                    where: {
                        userId,
                        status: OrderStatus.PENDING,
                    },
                }),
                prisma.order.count({
                    where: {
                        userId,
                        status: OrderStatus.DELIVERED,
                    },
                }),
                prisma.order.aggregate({
                    where: {
                        userId,
                        status: OrderStatus.DELIVERED,
                    },
                    _sum: { totalAmount: true },
                }),
            ]);
        return {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalSpent: totalSpent._sum.totalAmount || 0,
        };
    }

    async getSalesTrendAnalytics(timeRange: "day" | "week" | "month" | "year") {
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

        const [hourlySales, categorySales, averageOrderValue] =
            await Promise.all([
                prisma.order.groupBy({
                    by: ["createdAt"],
                    where: {
                        createdAt: { gte: startDate },
                        status: OrderStatus.DELIVERED,
                    },
                    _sum: { totalAmount: true },
                }),
                prisma.orderItem.groupBy({
                    by: ["productId"],
                    where: {
                        order: {
                            createdAt: { gte: startDate },
                            status: OrderStatus.DELIVERED,
                        },
                    },
                    _sum: { quantity: true },
                }),
                prisma.order.aggregate({
                    where: {
                        createdAt: { gte: startDate },
                        status: OrderStatus.DELIVERED,
                    },
                    _avg: { totalAmount: true },
                }),
            ]);

        return {
            hourlySales,
            categorySales,
            averageOrderValue: averageOrderValue._avg.totalAmount || 0,
        };
    }

    async getMarketingAnalytics(timeRange: "day" | "week" | "month" | "year") {
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

        const [newCustomers, repeatCustomers, customerRetention] =
            await Promise.all([
                prisma.user.count({
                    where: {
                        createdAt: { gte: startDate },
                    },
                }),
                prisma.order.groupBy({
                    by: ["userId"],
                    where: {
                        createdAt: { gte: startDate },
                    },
                    having: {
                        userId: {
                            _count: { gt: 1 },
                        },
                    },
                }),
                prisma.order.groupBy({
                    by: ["userId"],
                    where: {
                        createdAt: { gte: startDate },
                    },
                }),
            ]);

        return {
            newCustomers,
            repeatCustomers: repeatCustomers.length,
            customerRetention:
                (repeatCustomers.length / customerRetention.length) * 100,
        };
    }
}
