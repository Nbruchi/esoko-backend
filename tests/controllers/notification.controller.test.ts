import { NotificationController } from "@/controllers/notification.controller";
import { NotificationService } from "@/services/notification.service";
import { Request, Response } from "express";
import { NotificationType } from "@prisma/client";

jest.mock("@/services/notification.service");

describe("NotificationController", () => {
    let notificationController: NotificationController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNotificationService: jest.Mocked<NotificationService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNotificationService =
            new NotificationService() as jest.Mocked<NotificationService>;
        (NotificationService as jest.Mock).mockImplementation(
            () => mockNotificationService
        );
        notificationController = new NotificationController();
    });

    describe("getUserNotifications", () => {
        it("should return notifications", async () => {
            const mockNotifications = [
                {
                    id: "n1",
                    userId: "user1",
                    type: NotificationType.ORDER_PLACED,
                    message: "Test",
                    metadata: {},
                    isRead: false,
                    createdAt: new Date(),
                },
            ];
            mockNotificationService.getUserNotifications.mockResolvedValue({
                data: mockNotifications,
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: "CUSTOMER",
            };
            mockRequest.query = { page: "1", limit: "10" };
            await notificationController.getUserNotifications(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                data: mockNotifications,
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });
        it("should handle error", async () => {
            mockNotificationService.getUserNotifications.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: "CUSTOMER",
            };
            await notificationController.getUserNotifications(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("markAsRead", () => {
        it("should mark notification as read", async () => {
            const mockNotification = {
                id: "n1",
                userId: "user1",
                type: NotificationType.ORDER_PLACED,
                message: "Test",
                metadata: {},
                isRead: true,
                createdAt: new Date(),
            };
            mockNotificationService.markAsRead.mockResolvedValue(
                mockNotification
            );
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: "CUSTOMER",
            };
            mockRequest.params = { notificationId: "n1" };
            await notificationController.markAsRead(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockNotification);
        });
        it("should handle error", async () => {
            mockNotificationService.markAsRead.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: "CUSTOMER",
            };
            mockRequest.params = { notificationId: "n1" };
            await notificationController.markAsRead(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("deleteNotification", () => {
        it("should delete notification", async () => {
            mockNotificationService.deleteNotification.mockResolvedValue({
                id: "n1",
                userId: "user1",
                type: NotificationType.ORDER_PLACED,
                message: "Test",
                metadata: {},
                isRead: true,
                createdAt: new Date(),
            });
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: "CUSTOMER",
            };
            mockRequest.params = { notificationId: "n1" };
            await notificationController.deleteNotification(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Notification deleted successfully",
            });
        });
        it("should handle error", async () => {
            mockNotificationService.deleteNotification.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: "CUSTOMER",
            };
            mockRequest.params = { notificationId: "n1" };
            await notificationController.deleteNotification(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});
