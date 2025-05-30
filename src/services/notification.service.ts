import { prisma } from "@/config/database";
import { getIO } from "@/config/socket";
import { paginate, PaginationParams } from "@/utils/pagination";
import { Notification, NotificationType, User, Prisma } from "@prisma/client";

type NotificationMetadata = Record<string, unknown>;

export class NotificationService {
    private getSocketIO() {
        try {
            return getIO();
        } catch (error) {
            console.warn(
                "Socket.IO not initialized, notifications will not be sent in real-time"
            );
            return null;
        }
    }

    //Create notification
    async createNotification(data: {
        userId: string;
        type: NotificationType;
        message: string;
        metadata?: NotificationMetadata;
    }): Promise<Notification> {
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                message: data.message,
                metadata: data.metadata as Prisma.InputJsonValue,
            },
        });

        // Emit real-time notification if Socket.IO is available
        const io = this.getSocketIO();
        if (io) {
            io.to(data.userId).emit("notification", notification);
        }

        return notification;
    }

    //Get user notifications
    async getUserNotifications(userId: string, params: PaginationParams = {}) {
        return paginate(
            (skip, take) =>
                prisma.notification.findMany({
                    where: { userId },
                    skip,
                    take,
                    orderBy: { createdAt: "desc" },
                }),
            () => prisma.notification.count({ where: { userId } }),
            params
        );
    }

    //Mark notification as read
    async markAsRead(
        notificationId: string,
        userId: string
    ): Promise<Notification> {
        return prisma.notification.update({
            where: {
                id: notificationId,
                userId,
            },
            data: { isRead: true },
        });
    }

    //Mark all notifications as read
    async markAllAsRead(userId: string): Promise<number> {
        const result = await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: { isRead: true },
        });
        return result.count;
    }

    //Delete notification
    async deleteNotification(
        notificationId: string,
        userId: string
    ): Promise<Notification> {
        return prisma.notification.delete({
            where: {
                id: notificationId,
                userId,
            },
        });
    }

    // Get unread notification count
    async getUnreadCount(userId: string): Promise<number> {
        return prisma.notification.count({
            where: { userId, isRead: false },
        });
    }

    // Create multiple notifications
    async createBulkNotification(
        notifications: Array<{
            userId: string;
            type: NotificationType;
            message: string;
            metadata?: NotificationMetadata;
        }>
    ): Promise<Notification[]> {
        const created = await prisma.notification.createMany({
            data: notifications.map((n) => ({
                ...n,
                metadata: n.metadata as Prisma.InputJsonValue,
            })),
        });

        const createdNotifications = await prisma.notification.findMany({
            where: {
                userId: { in: notifications.map((n) => n.userId) },
                type: { in: notifications.map((n) => n.type) },
                message: { in: notifications.map((n) => n.message) },
            },
            orderBy: { createdAt: "desc" },
            take: notifications.length,
        });

        //Emit real-time notifications if Socket.IO is available
        const io = this.getSocketIO();
        if (io) {
            createdNotifications.forEach((notification) => {
                io.to(notification.userId).emit("notification", notification);
            });
        }

        return createdNotifications;
    }

    //Get notifications by type
    async getNotificationsByType(
        userId: string,
        type: NotificationType,
        params: PaginationParams = {}
    ) {
        return paginate(
            (skip, take) =>
                prisma.notification.findMany({
                    where: { userId, type },
                    skip,
                    take,
                    orderBy: { createdAt: "desc" },
                }),
            () => prisma.notification.count({ where: { userId, type } }),
            params
        );
    }

    //Delete all user notifications
    async deleteAllNotifications(userId: string): Promise<number> {
        const result = await prisma.notification.deleteMany({
            where: { userId },
        });

        return result.count;
    }

    // Update notification preferences
    async updateNotificationPreferences(
        userId: string,
        preferences: {
            emailNotifications: boolean;
            smsNotifications: boolean;
            orderUpdates: boolean;
            promotions: boolean;
            priceAlerts: boolean;
            stockAlerts: boolean;
        }
    ): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: {
                notificationPreferences: preferences,
            },
        });
    }

    // Create notication with template
    async createNotificationWithTemplate(data: {
        userId: string;
        type: NotificationType;
        template: string;
        variables: Record<string, unknown>;
    }): Promise<Notification> {
        const message = this.processTemplate(data.template, data.variables);
        return this.createNotification({
            userId: data.userId,
            type: data.type,
            message,
            metadata: {
                template: data.template,
                variables: data.variables,
            } as NotificationMetadata,
        });
    }

    //Get notifications by category
    async getNotificationsByCategory(
        userId: string,
        category: "order" | "promotion" | "system" | "alert",
        params: PaginationParams = {}
    ) {
        const typeMap = {
            order: [
                NotificationType.ORDER_PLACED,
                NotificationType.ORDER_CONFIRMED,
                NotificationType.ORDER_SHIPPED,
                NotificationType.ORDER_DELIVERED,
                NotificationType.ORDER_CANCELLED,
                NotificationType.PAYMENT_SUCCESS,
                NotificationType.PAYMENT_FAILED,
                NotificationType.REFUND_REQUESTED,
                NotificationType.REFUND_APPROVED,
                NotificationType.REFUND_REJECTED,
            ],
            promotion: [
                NotificationType.PROMOTIONAL,
                NotificationType.PRICE_ALERT,
            ],
            system: [
                NotificationType.SYSTEM_UPDATE,
                NotificationType.ACCOUNT_VERIFICATION,
                NotificationType.PASSWORD_RESET,
                NotificationType.SELLER_VERIFICATION,
            ],
            alert: [
                NotificationType.PRICE_ALERT,
                NotificationType.STOCK_ALERT,
                NotificationType.PRODUCT_REVIEW,
            ],
        };

        return paginate(
            (skip, take) =>
                prisma.notification.findMany({
                    where: {
                        userId,
                        type: { in: typeMap[category] },
                    },
                    skip,
                    take,
                    orderBy: { createdAt: "desc" },
                }),
            () =>
                prisma.notification.count({
                    where: {
                        userId,
                        type: { in: typeMap[category] },
                    },
                }),
            params
        );
    }

    //Create high priority notification
    async createHighPriorityNotification(data: {
        userId: string;
        type: NotificationType;
        message: string;
        metadata?: NotificationMetadata;
        priority: "high" | "medium" | "low";
    }): Promise<Notification> {
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                message: data.message,
                metadata: {
                    ...data.metadata,
                    priority: data.priority,
                } as Prisma.InputJsonValue,
            },
        });

        // Emit real-time notification with priority
        const io = this.getSocketIO();
        if (io) {
            io.to(data.userId).emit("notification", {
                ...notification,
                metadata: {
                    ...((notification.metadata as NotificationMetadata) || {}),
                    priority: data.priority,
                },
            });
        }

        return notification;
    }

    // Create expiring notification
    async createExpiringNotification(data: {
        userId: string;
        type: NotificationType;
        message: string;
        expiresAt: Date;
        metadata?: NotificationMetadata;
    }): Promise<Notification> {
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                message: data.message,
                metadata: {
                    ...data.metadata,
                    expiresAt: data.expiresAt,
                } as Prisma.InputJsonValue,
            },
        });

        //Schedule notification deletion
        setTimeout(async () => {
            await this.deleteNotification(notification.id, data.userId);
        }, data.expiresAt.getTime() - Date.now());

        return notification;
    }

    //Get notification statistics
    async getNotificationStats(userId: string): Promise<{
        totalNotifications: number;
        readNotifications: number;
        unreadNotifications: number;
        notificationsByType: Record<NotificationType, number>;
        lastNotificationDate: Date | null;
    }> {
        const [
            totalNotifications,
            readNotifications,
            unreadNotifications,
            notificationsByType,
            lastNotification,
        ] = await Promise.all([
            prisma.notification.count({ where: { userId } }),
            prisma.notification.count({
                where: { userId, isRead: true },
            }),
            prisma.notification.count({
                where: { userId, isRead: false },
            }),
            prisma.notification.groupBy({
                by: ["type"],
                where: { userId },
                _count: {
                    _all: true,
                },
            }),
            prisma.notification.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: { createdAt: true },
            }),
        ]);

        const typeCounts = notificationsByType.reduce(
            (acc, curr) => ({
                ...acc,
                [curr.type]: curr._count,
            }),
            {} as Record<NotificationType, number>
        );

        return {
            totalNotifications,
            readNotifications,
            unreadNotifications,
            notificationsByType: typeCounts,
            lastNotificationDate: lastNotification?.createdAt || null,
        };
    }

    // Get notification preferences
    async getNotificationPreferences(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { notificationPreferences: true },
        });
        return user?.notificationPreferences;
    }

    //Helper method to process template
    private processTemplate(
        template: string,
        variables: Record<string, unknown>
    ): string {
        return template.replace(/\${(\w+)}/g, (match, key) => {
            const value = variables[key];
            return value !== undefined ? String(value) : match;
        });
    }

    // Check if notification should be sent based on preferences
    async shouldSendNotification(
        userId: string,
        type: NotificationType
    ): Promise<boolean> {
        const preferences = (await this.getNotificationPreferences(userId)) as {
            orderUpdates: boolean;
            promotions: boolean;
            priceAlerts: boolean;
            stockAlerts: boolean;
        } | null;
        if (!preferences) return true;

        switch (type) {
            case NotificationType.ORDER_PLACED:
            case NotificationType.ORDER_CONFIRMED:
            case NotificationType.ORDER_SHIPPED:
            case NotificationType.ORDER_DELIVERED:
                return preferences.orderUpdates;
            case NotificationType.PROMOTIONAL:
                return preferences.promotions;
            case NotificationType.PRICE_ALERT:
                return preferences.priceAlerts;
            case NotificationType.STOCK_ALERT:
                return preferences.stockAlerts;
            default:
                return true;
        }
    }
}
