import { NotificationService } from "@/services/notification.service";
import { prisma } from "@/config/database";
import { NotificationType } from "@prisma/client";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        notification: {
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
            findFirst: jest.fn(),
            groupBy: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

// Mock Socket.IO
jest.mock("@/config/socket", () => ({
    getIO: jest.fn(() => ({
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
    })),
}));

describe("NotificationService", () => {
    let notificationService: NotificationService;
    const mockUserId = "user123";
    const mockNotificationId = "notification123";

    beforeEach(() => {
        notificationService = new NotificationService();
        jest.clearAllMocks();
    });

    describe("createNotification", () => {
        const mockNotificationData = {
            userId: mockUserId,
            type: NotificationType.ORDER_PLACED,
            message: "Test notification",
            metadata: { orderId: "order123" },
        };

        const mockCreatedNotification = {
            id: mockNotificationId,
            ...mockNotificationData,
            createdAt: new Date(),
            updatedAt: new Date(),
            isRead: false,
        };

        it("should create a notification successfully", async () => {
            (prisma.notification.create as jest.Mock).mockResolvedValue(
                mockCreatedNotification
            );

            const result =
                await notificationService.createNotification(
                    mockNotificationData
                );

            expect(prisma.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: mockNotificationData.userId,
                    type: mockNotificationData.type,
                    message: mockNotificationData.message,
                    metadata: mockNotificationData.metadata,
                },
            });
            expect(result).toEqual(mockCreatedNotification);
        });

        it("should handle empty metadata", async () => {
            const dataWithoutMetadata = {
                ...mockNotificationData,
                metadata: undefined,
            };
            (prisma.notification.create as jest.Mock).mockResolvedValue(
                mockCreatedNotification
            );

            await notificationService.createNotification(dataWithoutMetadata);

            expect(prisma.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: mockNotificationData.userId,
                    type: mockNotificationData.type,
                    message: mockNotificationData.message,
                    metadata: {},
                },
            });
        });
    });

    describe("getUserNotifications", () => {
        const mockNotifications = [
            {
                id: "1",
                userId: mockUserId,
                type: NotificationType.ORDER_PLACED,
                message: "Test 1",
                isRead: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: "2",
                userId: mockUserId,
                type: NotificationType.PROMOTIONAL,
                message: "Test 2",
                isRead: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        it("should return paginated notifications", async () => {
            (prisma.notification.findMany as jest.Mock).mockResolvedValue(
                mockNotifications
            );
            (prisma.notification.count as jest.Mock).mockResolvedValue(2);

            const result = await notificationService.getUserNotifications(
                mockUserId,
                {
                    page: 1,
                    limit: 10,
                }
            );

            expect(result).toEqual({
                data: mockNotifications,
                total: 2,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });
    });

    describe("markAsRead", () => {
        const mockUpdatedNotification = {
            id: mockNotificationId,
            userId: mockUserId,
            type: NotificationType.ORDER_PLACED,
            message: "Test notification",
            isRead: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it("should mark a notification as read", async () => {
            (prisma.notification.update as jest.Mock).mockResolvedValue(
                mockUpdatedNotification
            );

            const result = await notificationService.markAsRead(
                mockNotificationId,
                mockUserId
            );

            expect(prisma.notification.update).toHaveBeenCalledWith({
                where: {
                    id: mockNotificationId,
                    userId: mockUserId,
                },
                data: { isRead: true },
            });
            expect(result).toEqual(mockUpdatedNotification);
        });
    });

    describe("markAllAsRead", () => {
        it("should mark all notifications as read", async () => {
            (prisma.notification.updateMany as jest.Mock).mockResolvedValue({
                count: 5,
            });

            const result = await notificationService.markAllAsRead(mockUserId);

            expect(prisma.notification.updateMany).toHaveBeenCalledWith({
                where: {
                    userId: mockUserId,
                    isRead: false,
                },
                data: { isRead: true },
            });
            expect(result).toBe(5);
        });
    });

    describe("getUnreadCount", () => {
        it("should return the count of unread notifications", async () => {
            (prisma.notification.count as jest.Mock).mockResolvedValue(3);

            const result = await notificationService.getUnreadCount(mockUserId);

            expect(prisma.notification.count).toHaveBeenCalledWith({
                where: { userId: mockUserId, isRead: false },
            });
            expect(result).toBe(3);
        });
    });

    describe("deleteNotification", () => {
        const mockDeletedNotification = {
            id: mockNotificationId,
            userId: mockUserId,
            type: NotificationType.ORDER_PLACED,
            message: "Test notification",
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it("should delete a notification", async () => {
            (prisma.notification.delete as jest.Mock).mockResolvedValue(
                mockDeletedNotification
            );

            const result = await notificationService.deleteNotification(
                mockNotificationId,
                mockUserId
            );

            expect(prisma.notification.delete).toHaveBeenCalledWith({
                where: {
                    id: mockNotificationId,
                    userId: mockUserId,
                },
            });
            expect(result).toEqual(mockDeletedNotification);
        });
    });

    describe("getNotificationStats", () => {
        const mockStats = {
            totalNotifications: 10,
            readNotifications: 7,
            unreadNotifications: 3,
            notificationsByType: {
                [NotificationType.ORDER_PLACED]: { _all: 5 },
                [NotificationType.PROMOTIONAL]: { _all: 5 },
            },
            lastNotificationDate: new Date(),
        };

        it("should return notification statistics", async () => {
            (prisma.notification.count as jest.Mock)
                .mockResolvedValueOnce(10) // total
                .mockResolvedValueOnce(7) // read
                .mockResolvedValueOnce(3); // unread

            (prisma.notification.groupBy as jest.Mock).mockResolvedValue([
                { type: NotificationType.ORDER_PLACED, _count: { _all: 5 } },
                { type: NotificationType.PROMOTIONAL, _count: { _all: 5 } },
            ]);

            (prisma.notification.findFirst as jest.Mock).mockResolvedValue({
                createdAt: mockStats.lastNotificationDate,
            });

            const result =
                await notificationService.getNotificationStats(mockUserId);

            expect(result).toEqual(mockStats);
        });
    });
});
