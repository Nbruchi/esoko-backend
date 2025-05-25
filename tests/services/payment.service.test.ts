import { PaymentService } from "@/services/payment.service";
import { prisma } from "@/config/database";
import { stripe, STRIPE_CONFIG } from "@/config/stripe";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        order: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

// Mock Stripe
jest.mock("@/config/stripe", () => ({
    stripe: {
        paymentIntents: {
            create: jest.fn(),
            retrieve: jest.fn(),
        },
    },
    STRIPE_CONFIG: {
        minimumAmount: 1,
        maximumAmount: 10000,
        currency: "usd",
    },
}));

describe("PaymentService", () => {
    let paymentService: PaymentService;
    const mockOrderId = "order123";
    const mockOrder = {
        id: mockOrderId,
        total: 100,
        status: "PENDING",
        paymentStatus: PaymentStatus.PENDING,
    };

    const mockPaymentIntent = {
        id: "pi_123",
        client_secret: "secret_123",
        status: "succeeded",
        amount: 10000,
    };

    beforeEach(() => {
        paymentService = new PaymentService();
        jest.clearAllMocks();
    });

    describe("createPayment", () => {
        it("should create card payment successfully", async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
            (stripe.paymentIntents.create as jest.Mock).mockResolvedValue(
                mockPaymentIntent
            );

            const result = await paymentService.createPayment(
                mockOrderId,
                PaymentMethod.CARD,
                100
            );

            expect(result).toEqual({
                type: "card",
                paymentIntentId: mockPaymentIntent.id,
                clientSecret: mockPaymentIntent.client_secret,
            });
            expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
                amount: 10000,
                currency: STRIPE_CONFIG.currency,
            });
        });

        it("should handle cash on delivery payment", async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
            (prisma.order.update as jest.Mock).mockResolvedValue({
                ...mockOrder,
                paymentStatus: PaymentStatus.PENDING,
                status: "PROCESSING",
            });

            const result = await paymentService.createPayment(
                mockOrderId,
                PaymentMethod.CASH_ON_DELIVERY,
                100
            );

            expect(result).toEqual({
                type: "cash_on_delivery",
                status: "pending",
            });
            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: mockOrderId },
                data: {
                    paymentStatus: PaymentStatus.PENDING,
                    status: "PROCESSING",
                },
            });
        });

        it("should throw error if order not found", async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                paymentService.createPayment(
                    mockOrderId,
                    PaymentMethod.CARD,
                    100
                )
            ).rejects.toThrow("Order not found");
        });

        it("should throw error if amount is below minimum", async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

            await expect(
                paymentService.createPayment(
                    mockOrderId,
                    PaymentMethod.CARD,
                    0.5
                )
            ).rejects.toThrow(
                `Amount must be at least ${STRIPE_CONFIG.minimumAmount} ${STRIPE_CONFIG.currency}`
            );
        });

        it("should throw error if amount exceeds maximum", async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

            await expect(
                paymentService.createPayment(
                    mockOrderId,
                    PaymentMethod.CARD,
                    20000
                )
            ).rejects.toThrow(
                `Amount cannot exceed ${STRIPE_CONFIG.maximumAmount} ${STRIPE_CONFIG.currency}`
            );
        });
    });

    describe("confirmPayment", () => {
        it("should confirm card payment successfully", async () => {
            (stripe.paymentIntents.retrieve as jest.Mock).mockResolvedValue(
                mockPaymentIntent
            );

            const result = await paymentService.confirmPayment(
                mockPaymentIntent.id,
                PaymentMethod.CARD
            );

            expect(result).toEqual({
                status: mockPaymentIntent.status,
                amount: mockPaymentIntent.amount / 100,
            });
            expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
                mockPaymentIntent.id
            );
        });

        it("should throw error for invalid payment method", async () => {
            await expect(
                paymentService.confirmPayment(
                    "payment123",
                    PaymentMethod.CASH_ON_DELIVERY
                )
            ).rejects.toThrow("Invalid payment method");
        });
    });

    describe("handleWebhook", () => {
        it("should handle payment success", async () => {
            const mockEvent = {
                type: "payment_intent.succeeded",
                data: {
                    object: mockPaymentIntent,
                },
            };
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);
            (prisma.order.update as jest.Mock).mockResolvedValue({
                ...mockOrder,
                paymentStatus: PaymentStatus.COMPLETED,
                status: "PROCESSING",
            });

            await paymentService.handleWebhook(mockEvent);

            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: mockOrder.id },
                data: {
                    paymentStatus: PaymentStatus.COMPLETED,
                    status: "PROCESSING",
                },
            });
        });

        it("should handle payment failure", async () => {
            const mockEvent = {
                type: "payment_intent.payment_failed",
                data: {
                    object: mockPaymentIntent,
                },
            };
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);
            (prisma.order.update as jest.Mock).mockResolvedValue({
                ...mockOrder,
                paymentStatus: PaymentStatus.FAILED,
            });

            await paymentService.handleWebhook(mockEvent);

            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: mockOrder.id },
                data: {
                    paymentStatus: PaymentStatus.FAILED,
                },
            });
        });

        it("should handle refund", async () => {
            const mockEvent = {
                type: "charge.refunded",
                data: {
                    object: {
                        payment_intent: mockPaymentIntent.id,
                    },
                },
            };
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);
            (prisma.order.update as jest.Mock).mockResolvedValue({
                ...mockOrder,
                paymentStatus: PaymentStatus.REFUNDED,
            });

            await paymentService.handleWebhook(mockEvent);

            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: mockOrder.id },
                data: {
                    paymentStatus: PaymentStatus.REFUNDED,
                },
            });
        });
    });
});
