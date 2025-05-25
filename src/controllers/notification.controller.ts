import { Request, Response } from "express";
import { NotificationService } from "@/services/notification.service";
import { NotificationType } from "@prisma/client";

export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    // Create notification
    async createNotification(req: Request, res: Response) {
        try {
            const { userId, type, message, metadata } = req.body;
            const notification =
                await this.notificationService.createNotification({
                    userId,
                    type,
                    message,
                    metadata,
                });
            res.status(201).json(notification);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get user notifications
    async getUserNotifications(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { page, limit } = req.query;
            const notifications =
                await this.notificationService.getUserNotifications(userId, {
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                });
            res.json(notifications);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Mark notification as read
    async markAsRead(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { notificationId } = req.params;
            const notification = await this.notificationService.markAsRead(
                notificationId,
                userId
            );
            res.json(notification);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Mark all notifications as read
    async markAllAsRead(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const count = await this.notificationService.markAllAsRead(userId);
            res.json({ count });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Delete notification
    async deleteNotification(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { notificationId } = req.params;
            await this.notificationService.deleteNotification(
                notificationId,
                userId
            );
            res.json({ message: "Notification deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get unread count
    async getUnreadCount(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const count = await this.notificationService.getUnreadCount(userId);
            res.json({ count });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Create bulk notifications
    async createBulkNotification(req: Request, res: Response) {
        try {
            const { notifications } = req.body;
            const result =
                await this.notificationService.createBulkNotification(
                    notifications
                );
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get notifications by type
    async getNotificationsByType(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { type } = req.params;
            const { page, limit } = req.query;
            const notifications =
                await this.notificationService.getNotificationsByType(
                    userId,
                    type as NotificationType,
                    {
                        page: Number(page) || 1,
                        limit: Number(limit) || 10,
                    }
                );
            res.json(notifications);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Delete all notifications
    async deleteAllNotifications(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const count =
                await this.notificationService.deleteAllNotifications(userId);
            res.json({ count });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update notification preferences
    async updateNotificationPreferences(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const preferences = req.body;
            const user =
                await this.notificationService.updateNotificationPreferences(
                    userId,
                    preferences
                );
            res.json(user);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Create notification with template
    async createNotificationWithTemplate(req: Request, res: Response) {
        try {
            const { userId, type, template, variables } = req.body;
            const notification =
                await this.notificationService.createNotificationWithTemplate({
                    userId,
                    type,
                    template,
                    variables,
                });
            res.status(201).json(notification);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get notifications by category
    async getNotificationsByCategory(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { category } = req.params;
            const { page, limit } = req.query;
            const notifications =
                await this.notificationService.getNotificationsByCategory(
                    userId,
                    category as "order" | "promotion" | "system" | "alert",
                    {
                        page: Number(page) || 1,
                        limit: Number(limit) || 10,
                    }
                );
            res.json(notifications);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Create high priority notification
    async createHighPriorityNotification(req: Request, res: Response) {
        try {
            const { userId, type, message, metadata, priority } = req.body;
            const notification =
                await this.notificationService.createHighPriorityNotification({
                    userId,
                    type,
                    message,
                    metadata,
                    priority,
                });
            res.status(201).json(notification);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Create expiring notification
    async createExpiringNotification(req: Request, res: Response) {
        try {
            const { userId, type, message, expiresAt, metadata } = req.body;
            const notification =
                await this.notificationService.createExpiringNotification({
                    userId,
                    type,
                    message,
                    expiresAt: new Date(expiresAt),
                    metadata,
                });
            res.status(201).json(notification);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get notification statistics
    async getNotificationStats(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const stats =
                await this.notificationService.getNotificationStats(userId);
            res.json(stats);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get notification preferences
    async getNotificationPreferences(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const preferences =
                await this.notificationService.getNotificationPreferences(
                    userId
                );
            res.json(preferences);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
