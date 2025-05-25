import { UserService } from "@/services/user.service";
import { prisma } from "@/config/database";
import bcrypt from "bcryptjs";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        $transaction: jest.fn((callback) => callback(prisma)),
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        address: {
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

describe("UserService", () => {
    let userService: UserService;
    const mockUserId = "user123";
    const mockAddressId = "address123";

    const mockUser = {
        id: mockUserId,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "hashedPassword",
        phoneNumber: "1234567890",
        profilePhoto: "photo.jpg",
        isVerified: true,
        addresses: [],
        sellerProfile: null,
    };

    const mockAddress = {
        id: mockAddressId,
        userId: mockUserId,
        street: "123 Main St",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        postalCode: "12345",
        isDefault: false,
    };

    beforeEach(() => {
        userService = new UserService();
        jest.clearAllMocks();
    });

    describe("getUserProfile", () => {
        it("should return user profile without password", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.getUserProfile(mockUserId);

            expect(result).toEqual({
                ...mockUser,
                password: undefined,
            });
        });

        it("should throw error if user not found", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                userService.getUserProfile(mockUserId)
            ).rejects.toThrow("User not found");
        });
    });

    describe("updateUserProfile", () => {
        const updateData = {
            firstName: "Jane",
            lastName: "Smith",
            phoneNumber: "9876543210",
        };

        it("should update user profile successfully", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                ...updateData,
            });

            const result = await userService.updateUserProfile(
                mockUserId,
                updateData
            );

            expect(result).toEqual({
                ...mockUser,
                ...updateData,
                password: undefined,
            });
        });

        it("should throw error if user not found", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                userService.updateUserProfile(mockUserId, updateData)
            ).rejects.toThrow("User not found");
        });
    });

    describe("addAddress", () => {
        const addressData = {
            street: "123 Main St",
            city: "Test City",
            state: "Test State",
            country: "Test Country",
            postalCode: "12345",
            isDefault: true,
        };

        it("should add address and set as default", async () => {
            (prisma.address.create as jest.Mock).mockResolvedValue({
                ...addressData,
                id: mockAddressId,
                userId: mockUserId,
            });

            const result = await userService.addAddress(
                mockUserId,
                addressData
            );

            expect(result).toEqual({
                ...addressData,
                id: mockAddressId,
                userId: mockUserId,
            });
            expect(prisma.address.updateMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
                data: { isDefault: false },
            });
        });
    });

    describe("getUserAddress", () => {
        it("should return user addresses", async () => {
            const mockAddresses = [mockAddress];
            (prisma.address.findMany as jest.Mock).mockResolvedValue(
                mockAddresses
            );

            const result = await userService.getUserAddress(mockUserId);

            expect(result).toEqual(mockAddresses);
        });
    });

    describe("updateAddress", () => {
        const updateData = {
            street: "456 New St",
            city: "New City",
        };

        it("should update address successfully", async () => {
            (prisma.address.update as jest.Mock).mockResolvedValue({
                ...mockAddress,
                ...updateData,
            });

            const result = await userService.updateAddress(
                mockUserId,
                mockAddressId,
                updateData
            );

            expect(result).toEqual({
                ...mockAddress,
                ...updateData,
            });
        });
    });

    describe("deleteAddress", () => {
        it("should delete address successfully", async () => {
            (prisma.address.delete as jest.Mock).mockResolvedValue(mockAddress);

            const result = await userService.deleteAddress(
                mockUserId,
                mockAddressId
            );

            expect(result).toEqual(mockAddress);
        });
    });

    describe("setDefaultAddress", () => {
        it("should set address as default", async () => {
            (prisma.address.update as jest.Mock).mockResolvedValue({
                ...mockAddress,
                isDefault: true,
            });

            const result = await userService.setDefaultAddress(
                mockUserId,
                mockAddressId
            );

            expect(result.isDefault).toBe(true);
            expect(prisma.address.updateMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
                data: { isDefault: false },
            });
        });
    });

    describe("changePassword", () => {
        const currentPassword = "currentPass";
        const newPassword = "newPass";
        const hashedNewPassword = "hashedNewPass";

        it("should change password successfully", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                password: "hashedCurrentPass",
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
            (prisma.user.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                password: hashedNewPassword,
            });

            const result = await userService.changePassword(
                mockUserId,
                currentPassword,
                newPassword
            );

            expect(result.password).toBe(hashedNewPassword);
        });

        it("should throw error if current password is incorrect", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                password: "hashedCurrentPass",
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                userService.changePassword(
                    mockUserId,
                    currentPassword,
                    newPassword
                )
            ).rejects.toThrow("Current password is incorrect");
        });
    });

    describe("deleteAccount", () => {
        it("should delete user account successfully", async () => {
            (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.deleteAccount(mockUserId);

            expect(result).toEqual(mockUser);
        });
    });

    describe("updateEmail", () => {
        const newEmail = "new@example.com";

        it("should update email successfully", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                email: newEmail,
                isVerified: false,
            });

            const result = await userService.updateEmail(mockUserId, newEmail);

            expect(result.email).toBe(newEmail);
            expect(result.isVerified).toBe(false);
        });

        it("should throw error if email already in use", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: "otherUserId",
            });

            await expect(
                userService.updateEmail(mockUserId, newEmail)
            ).rejects.toThrow("Email already in use");
        });
    });
});
