import { PaymentController } from "@/controllers/payment.controller";
import { PaymentService } from "@/services/payment.service";
import { Request, Response } from "express";
import { PaymentMethod } from "@prisma/client";

jest.mock("@/services/payment.service");

describe("PaymentController", () => {
    let paymentController: PaymentController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockPaymentService: jest.Mocked<PaymentService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockPaymentService =
            new PaymentService() as jest.Mocked<PaymentService>;
        (PaymentService as jest.Mock).mockImplementation(
            () => mockPaymentService
        );
        paymentController = new PaymentController();
    });

    describe("createPayment", () => {
        it("should create payment", async () => {
            const mockPayment = {
                type: "CARD" as PaymentMethod,
                paymentIntentId: "pi_123",
                clientSecret: "secret",
            };
            mockPaymentService.createPayment.mockResolvedValue(mockPayment);
            mockRequest.body = { orderId: "o1", method: "CARD", amount: 100 };
            await paymentController.createPayment(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockPayment);
        });

        it("should handle missing required fields", async () => {
            mockRequest.body = { orderId: "o1" }; // Missing method and amount
            await paymentController.createPayment(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Order ID, payment method, and amount are required",
            });
        });

        it("should handle error", async () => {
            const errorMessage = "Payment creation failed";
            mockPaymentService.createPayment.mockRejectedValue(
                new Error(errorMessage)
            );
            mockRequest.body = { orderId: "o1", method: "CARD", amount: 100 };
            await paymentController.createPayment(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: errorMessage,
            });
        });
    });

    describe("confirmPayment", () => {
        it("should confirm payment", async () => {
            const mockPayment = { status: "succeeded" as any, amount: 1000 };
            mockPaymentService.confirmPayment.mockResolvedValue(mockPayment);
            mockRequest.body = { paymentId: "p1", method: "CARD" as PaymentMethod };
            await paymentController.confirmPayment(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockPayment);
        });

        it("should handle missing required fields", async () => {
            mockRequest.body = { paymentId: "p1" }; // Missing method
            await paymentController.confirmPayment(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Payment ID and method are required",
            });
        });

        it("should handle error", async () => {
            const errorMessage = "Payment confirmation failed";
            mockPaymentService.confirmPayment.mockRejectedValue(
                new Error(errorMessage)
            );
            mockRequest.body = { paymentId: "p1", method: "CARD" as PaymentMethod };
            await paymentController.confirmPayment(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: errorMessage,
            });
        });
    });

    describe("handleWebhook", () => {
        it("should handle webhook", async () => {
            mockPaymentService.handleWebhook.mockResolvedValue(undefined);
            mockRequest.body = { event: "payment_intent.succeeded" };
            await paymentController.handleWebhook(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                received: true,
            });
        });

        it("should handle error", async () => {
            const errorMessage = "Webhook processing failed";
            mockPaymentService.handleWebhook.mockRejectedValue(
                new Error(errorMessage)
            );
            mockRequest.body = { event: "payment_intent.succeeded" };
            await paymentController.handleWebhook(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: errorMessage,
            });
        });
    });
});
