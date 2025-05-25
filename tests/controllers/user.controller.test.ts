import { UserController } from "@/controllers/user.controller";
import { UserService } from "@/services/user.service";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";

jest.mock("@/services/user.service");

describe("UserController", () => {
    let userController: UserController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockUserService: jest.Mocked<UserService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockUserService = new UserService() as jest.Mocked<UserService>;
        (UserService as jest.Mock).mockImplementation(() => mockUserService);
        userController = new UserController();
    });

    describe("getUser", () => {
        it("should return user", async () => {
            const mockUser = {
                id: "u1",
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                role: UserRole.CUSTOMER,
                phoneNumber: null,
                profilePhoto: null,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLogin: null,
                notificationPreferences: null,
                sellerProfile: null,
                addresses: [],
                verificationToken: null,
                resetToken: null,
                resetTokenExpiry: null,
                settings: null,
            };
            mockUserService.getUserProfile.mockResolvedValue(mockUser);
            mockRequest.user = {
                userId: "u1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            await userController.getProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        });
        it("should handle error", async () => {
            mockUserService.getUserProfile.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "u1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            await userController.getProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("updateUser", () => {
        it("should update user", async () => {
            const mockUser = {
                id: "u1",
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                role: UserRole.CUSTOMER,
                phoneNumber: null,
                profilePhoto: null,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLogin: null,
                notificationPreferences: null,
                sellerProfile: null,
                addresses: [],
                verificationToken: null,
                resetToken: null,
                resetTokenExpiry: null,
                settings: null,
            };
            mockUserService.updateUserProfile.mockResolvedValue(mockUser);
            mockRequest.user = {
                userId: "u1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = { email: "test@example.com" };
            await userController.updateProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        });
        it("should handle error", async () => {
            mockUserService.updateUserProfile.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.user = {
                userId: "u1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = { email: "test@example.com" };
            await userController.updateProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("deleteUser", () => {
        it("should delete user", async () => {
            const mockUser = {
                id: "u1",
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                role: UserRole.CUSTOMER,
                phoneNumber: null,
                profilePhoto: null,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLogin: null,
                notificationPreferences: null,
                sellerProfile: null,
                addresses: [],
                verificationToken: null,
                resetToken: null,
                resetTokenExpiry: null,
                settings: null,
                password: "dummy-password",
            };
            mockUserService.deleteAccount.mockResolvedValue(mockUser);
            mockRequest.user = {
                userId: "u1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            await userController.deleteAccount(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Account deleted successfully",
            });
        });
        it("should handle error", async () => {
            mockUserService.deleteAccount.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "u1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            await userController.deleteAccount(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});
