import { Request, Response } from "express";
import { OrderService } from "@/services/order.service";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export class OrderController {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    // Create order
    async createOrder(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { addressId, items, paymentMethod } = req.body;
            const order = await this.orderService.createOrder({
                userId,
                addressId,
                items,
                paymentMethod: paymentMethod as PaymentMethod,
            });
            res.status(201).json(order);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get order by ID
    async getOrderById(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { orderId } = req.params;
            const order = await this.orderService.getOrderById(orderId, userId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            res.json(order);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get user orders
    async getUserOrders(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { page, limit } = req.query;
            const orders = await this.orderService.getUserOrders(userId, {
                page: Number(page) || 1,
                limit: Number(limit) || 10,
            });
            res.json(orders);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update order status
    async updateOrderStatus(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            const order = await this.orderService.updateOrderStatus(
                orderId,
                status as OrderStatus
            );
            res.json(order);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update payment status
    async updatePaymentStatus(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            const order = await this.orderService.updatePaymentStatus(
                orderId,
                status as PaymentStatus
            );
            res.json(order);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Cancel order
    async cancelOrder(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { orderId } = req.params;
            const order = await this.orderService.cancelOrder(orderId, userId);
            res.json(order);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get orders by status
    async getOrdersByStatus(req: Request, res: Response) {
        try {
            const { status } = req.params;
            const { page, limit } = req.query;
            const orders = await this.orderService.getOrdersByStatus(
                status as OrderStatus,
                {
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                }
            );
            res.json(orders);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get orders by date range
    async getOrdersByDateRange(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    message: "Start date and end date are required",
                });
            }
            const { page, limit } = req.query;
            const orders = await this.orderService.getOrdersByDateRange(
                new Date(startDate as string),
                new Date(endDate as string),
                {
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                }
            );
            res.json(orders);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get order statistics
    async getOrderStatistics(req: Request, res: Response) {
        try {
            const stats = await this.orderService.getOrderStatistics();
            res.json(stats);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get user order statistics
    async getUserOrderStatistics(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const stats =
                await this.orderService.getUserOrderStatistics(userId);
            res.json(stats);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get sales trend analytics
    async getSalesTrendAnalytics(req: Request, res: Response) {
        try {
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
            const analytics = await this.orderService.getSalesTrendAnalytics(
                timeRange as "day" | "week" | "month" | "year"
            );
            res.json(analytics);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get marketing analytics
    async getMarketingAnalytics(req: Request, res: Response) {
        try {
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
            const analytics = await this.orderService.getMarketingAnalytics(
                timeRange as "day" | "week" | "month" | "year"
            );
            res.json(analytics);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
