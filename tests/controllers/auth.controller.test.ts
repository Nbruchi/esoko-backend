import { AuthController } from "@/controllers/auth.controller";
import { AuthService } from "@/services/auth.service";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";

// Mock AuthService
jest.mock("@/services/auth.service");

describe("AuthController", () => {
    let authController: AuthController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockAuthService: jest.Mocked<AuthService>;

    const mockUserData = {
        id: "user123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        phoneNumber: null,
        profilePhoto: null,
        isVerified: false,
        isActive: true,
        lastLogin: null,
        verificationToken: null,
        resetToken: null,
        resetTokenExpiry: null,
        notificationPreferences: {},
        settings: {},
    };

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockAuthService = new AuthService() as jest.Mocked<AuthService>;
        (AuthService as jest.Mock).mockImplementation(() => mockAuthService);
        authController = new AuthController();
    });

    describe("register", () => {
        it("should return 201 and user data on successful registration", async () => {
            const mockAuthResponse = {
                user: mockUserData,
                tokens: {
                    accessToken: "access-token",
                    refreshToken: "refresh-token",
                },
            };
            mockAuthService.register.mockResolvedValue(mockAuthResponse);
            mockRequest.body = {
                email: "test@example.com",
                password: "password123",
                firstName: "John",
                lastName: "Doe",
            };

            await authController.register(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockAuthResponse);
        });

        it("should return 400 when registration fails", async () => {
            mockAuthService.register.mockRejectedValue(
                new Error("Email already exists")
            );
            mockRequest.body = {
                email: "test@example.com",
                password: "password123",
                firstName: "John",
                lastName: "Doe",
            };

            await authController.register(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Email already exists",
            });
        });
    });

    describe("login", () => {
        it("should return 200 and user data on successful login", async () => {
            const mockAuthResponse = {
                user: mockUserData,
                tokens: {
                    accessToken: "access-token",
                    refreshToken: "refresh-token",
                },
            };
            mockAuthService.login.mockResolvedValue(mockAuthResponse);
            mockRequest.body = {
                email: "test@example.com",
                password: "password123",
            };

            await authController.login(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockAuthResponse);
        });

        it("should return 400 when login fails", async () => {
            mockAuthService.login.mockRejectedValue(
                new Error("Invalid credentials")
            );
            mockRequest.body = {
                email: "test@example.com",
                password: "wrongpassword",
            };

            await authController.login(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Invalid credentials",
            });
        });
    });

    describe("verifyEmail", () => {
        it("should verify email successfully", async () => {
            const token = "verification-token";
            mockAuthService.verifyEmail.mockResolvedValue(undefined);
            mockRequest.params = { token };

            await authController.verifyEmail(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Email verified successfully",
            });
        });

        it("should handle verification error", async () => {
            const error = new Error("Invalid token");
            mockAuthService.verifyEmail.mockRejectedValue(error);
            mockRequest.params = { token: "invalid-token" };

            await authController.verifyEmail(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Invalid token",
            });
        });
    });

    describe("requestPasswordReset", () => {
        it("should request password reset successfully", async () => {
            const email = "test@example.com";
            mockAuthService.requestPasswordReset.mockResolvedValue(undefined);
            mockRequest.body = { email };

            await authController.requestPasswordReset(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Password reset instructions sent to email",
            });
        });

        it("should handle password reset request error", async () => {
            const error = new Error("User not found");
            mockAuthService.requestPasswordReset.mockRejectedValue(error);
            mockRequest.body = { email: "nonexistent@example.com" };

            await authController.requestPasswordReset(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User not found",
            });
        });
    });

    describe("resetPassword", () => {
        it("should reset password successfully", async () => {
            const resetData = {
                token: "reset-token",
                password: "newPassword123",
            };
            mockAuthService.resetPassword.mockResolvedValue(undefined);
            mockRequest.body = resetData;

            await authController.resetPassword(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Password reset successful",
            });
        });

        it("should handle password reset error", async () => {
            const error = new Error("Invalid token");
            mockAuthService.resetPassword.mockRejectedValue(error);
            mockRequest.body = {
                token: "invalid-token",
                password: "newPassword123",
            };

            await authController.resetPassword(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Invalid token",
            });
        });
    });

    describe("changePassword", () => {
        it("should change password successfully", async () => {
            const changeData = {
                currentPassword: "oldPassword123",
                newPassword: "newPassword123",
            };
            mockAuthService.changePassword.mockResolvedValue(undefined);
            mockRequest.user = {
                userId: "user123",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = changeData;

            await authController.changePassword(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Password updated successfully!",
            });
        });

        it("should handle unauthenticated user", async () => {
            mockRequest.user = undefined;
            mockRequest.body = {
                currentPassword: "oldPassword123",
                newPassword: "newPassword123",
            };

            await authController.changePassword(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User not authenticated",
            });
        });

        it("should handle password change error", async () => {
            const error = new Error("Current password is incorrect");
            mockAuthService.changePassword.mockRejectedValue(error);
            mockRequest.user = {
                userId: "user123",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = {
                currentPassword: "wrongPassword",
                newPassword: "newPassword123",
            };

            await authController.changePassword(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Current password is incorrect",
            });
        });
    });

    describe("logout", () => {
        it("should logout successfully", async () => {
            mockAuthService.logout.mockResolvedValue(undefined);
            mockRequest.user = {
                userId: "user123",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };

            await authController.logout(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Logged out successfully",
            });
        });

        it("should handle unauthenticated user", async () => {
            mockRequest.user = undefined;

            await authController.logout(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User not authenticated",
            });
        });

        it("should handle logout error", async () => {
            const error = new Error("Logout failed");
            mockAuthService.logout.mockRejectedValue(error);
            mockRequest.user = {
                userId: "user123",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };

            await authController.logout(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Logout failed",
            });
        });
    });

    describe("getCurrentUser", () => {
        it("should get current user successfully", async () => {
            mockAuthService.getCurrentUser.mockResolvedValue(mockUserData);
            mockRequest.user = {
                userId: "user123",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };

            await authController.getCurrentUser(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith(mockUserData);
        });

        it("should handle unauthenticated user", async () => {
            mockRequest.user = undefined;

            await authController.getCurrentUser(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User not authenticated",
            });
        });

        it("should handle get current user error", async () => {
            const error = new Error("User not found");
            mockAuthService.getCurrentUser.mockRejectedValue(error);
            mockRequest.user = {
                userId: "user123",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };

            await authController.getCurrentUser(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "User not found",
            });
        });
    });
});
