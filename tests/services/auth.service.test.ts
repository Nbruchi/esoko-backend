import { AuthService } from "@/services/auth.service";
import { prisma } from "@/config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EmailService } from "@/services/email.service";

// Mock EmailService
jest.mock("@/services/email.service", () => ({
    EmailService: jest.fn().mockImplementation(() => ({
        sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    })),
}));

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

describe("AuthService", () => {
    let authService: AuthService;
    const mockUser = {
        id: "user123",
        email: "test@example.com",
        password: "hashedPassword",
        firstName: "Test",
        lastName: "User",
    };

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe("register", () => {
        const mockRegisterData = {
            email: "test@example.com",
            password: "password123",
            firstName: "Test",
            lastName: "User",
        };

        it("should register a new user successfully", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (jwt.sign as jest.Mock).mockReturnValue("mockToken");

            const result = await authService.register(mockRegisterData);

            expect(result).toHaveProperty("tokens");
            expect(result).toHaveProperty("user");
            expect(result.user).not.toHaveProperty("password");
        });

        it("should throw error if email already exists", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            await expect(
                authService.register(mockRegisterData)
            ).rejects.toThrow("User already exists");
        });
    });

    describe("login", () => {
        const mockEmail = "test@example.com";
        const mockPassword = "password123";

        it("should login successfully with correct credentials", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue("mockToken");

            const result = await authService.login(mockEmail, mockPassword);

            expect(result).toHaveProperty("tokens");
            expect(result).toHaveProperty("user");
            expect(result.user).not.toHaveProperty("password");
        });

        it("should throw error if user not found", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                authService.login(mockEmail, mockPassword)
            ).rejects.toThrow("Invalid credentials");
        });

        it("should throw error if password is incorrect", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                authService.login(mockEmail, mockPassword)
            ).rejects.toThrow("Invalid credentials");
        });
    });

    describe("getCurrentUser", () => {
        const mockUserId = "user123";
        const { password, ...userWithoutPassword } = mockUser;

        it("should return user if found", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await authService.getCurrentUser(mockUserId);

            expect(result).toEqual(userWithoutPassword);
        });

        it("should throw error if user not found", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                authService.getCurrentUser(mockUserId)
            ).rejects.toThrow("User not found");
        });
    });
});
