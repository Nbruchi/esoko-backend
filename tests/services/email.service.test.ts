import { EmailService } from "@/services/email.service";
import { prisma } from "@/config/database";
import nodemailer from "nodemailer";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

// Mock nodemailer
jest.mock("nodemailer", () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn(),
    })),
}));

describe("EmailService", () => {
    let emailService: EmailService;
    let mockSendMail: jest.Mock;

    beforeEach(() => {
        mockSendMail = jest.fn();
        (nodemailer.createTransport as jest.Mock).mockReturnValue({
            sendMail: mockSendMail,
        });
        emailService = new EmailService();
        jest.clearAllMocks();
    });

    describe("sendVerificationEmail", () => {
        const mockUserId = "user123";
        const mockToken = "token123";
        const mockUser = { email: "test@example.com", firstName: "Test" };

        beforeEach(() => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        });

        it("should send a verification email successfully", async () => {
            mockSendMail.mockResolvedValueOnce({ messageId: "123" });

            await emailService.sendVerificationEmail(mockUserId, mockToken);

            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: mockUser.email,
                    subject: "Verify your email address",
                })
            );
        });

        it("should handle email sending errors", async () => {
            mockSendMail.mockRejectedValueOnce(
                new Error("Failed to send email")
            );

            await expect(
                emailService.sendVerificationEmail(mockUserId, mockToken)
            ).rejects.toThrow("Failed to send email");
        });

        it("should throw an error if user is not found", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                emailService.sendVerificationEmail(mockUserId, mockToken)
            ).rejects.toThrow("User not found");
        });
    });
});
