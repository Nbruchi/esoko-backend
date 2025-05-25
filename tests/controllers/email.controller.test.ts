import { EmailController } from "@/controllers/email.controller";
import { EmailService } from "@/services/email.service";
import { Request, Response } from "express";

jest.mock("@/services/email.service");

describe("EmailController", () => {
    let emailController: EmailController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockEmailService: jest.Mocked<EmailService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockEmailService = new EmailService() as jest.Mocked<EmailService>;
        (EmailService as jest.Mock).mockImplementation(() => mockEmailService);
        emailController = new EmailController();
    });

    describe("sendVerificationEmail", () => {
        it("should send verification email", async () => {
            mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);
            mockRequest.body = {
                userId: "user123",
                token: "token123",
            };
            await emailController.sendVerificationEmail(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Verification email sent successfully",
            });
        });
        it("should handle error", async () => {
            mockEmailService.sendVerificationEmail.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.body = {
                userId: "user123",
                token: "token123",
            };
            await emailController.sendVerificationEmail(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});
