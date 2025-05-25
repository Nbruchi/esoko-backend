import { OrderService } from "@/services/order.service";
import { prisma } from "@/config/database";
import { stripe } from "@/config/stripe";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        $transaction: jest.fn((callback) => callback(prisma)),
        order: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

// Mock Stripe
jest.mock("@/config/stripe", () => ({
    stripe: {
        paymentIntents: {
            create: jest.fn(),
        },
    },
}));

describe("OrderService", () => {
    let orderService: OrderService;
    const mockUserId = "user123";
    const mockAddressId = "address123";
    const mockProductId = "prod123";
    const mockOrderId = "order123";

    const mockProduct = {
        id: mockProductId,
        name: "Test Product",
        price: 100,
        stock: 10,
    };

    const mockOrder = {
        id: mockOrderId,
        userId: mockUserId,
        addressId: mockAddressId,
        totalAmount: 200,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CARD,
        items: [
            {
                productId: mockProductId,
                quantity: 2,
                price: 100,
                product: mockProduct,
            },
        ],
    };

    beforeEach(() => {
        orderService = new OrderService();
        jest.clearAllMocks();
    });

    describe("createOrder", () => {
        const mockOrderData = {
            userId: mockUserId,
            addressId: mockAddressId,
            items: [{ productId: mockProductId, quantity: 2 }],
            paymentMethod: PaymentMethod.CARD,
        };

        it("should create order successfully", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct
            );
            (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
            (stripe.paymentIntents.create as jest.Mock).mockResolvedValue({
                id: "pi_123",
            });

            const result = await orderService.createOrder(mockOrderData);

            expect(result).toEqual(mockOrder);
            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: mockProductId },
                data: { stock: 8 },
            });
            expect(prisma.order.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        userId: mockUserId,
                        addressId: mockAddressId,
                        totalAmount: 200,
                        paymentMethod: PaymentMethod.CARD,
                        paymentStatus: PaymentStatus.PENDING,
                        status: OrderStatus.PENDING,
                    }),
                })
            );
        });

        it("should throw error if product not found", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                orderService.createOrder(mockOrderData)
            ).rejects.toThrow(`Product ${mockProductId} not found`);
        });

        it("should throw error if insufficient stock", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                ...mockProduct,
                stock: 1,
            });

            await expect(
                orderService.createOrder(mockOrderData)
            ).rejects.toThrow(
                `Insufficient stock for product ${mockProduct.name}`
            );
        });
    });

    describe("getOrderById", () => {
        it("should return order if found", async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);

            const result = await orderService.getOrderById(
                mockOrderId,
                mockUserId
            );

            expect(result).toEqual(mockOrder);
            expect(prisma.order.findFirst).toHaveBeenCalledWith({
                where: {
                    id: mockOrderId,
                    userId: mockUserId,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    address: true,
                },
            });
        });

        it("should return null if order not found", async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await orderService.getOrderById(
                mockOrderId,
                mockUserId
            );

            expect(result).toBeNull();
        });
    });

    describe("getUserOrders", () => {
        const mockOrders = [mockOrder];
        const mockPaginationParams = {
            page: 1,
            limit: 10,
        };

        it("should return paginated orders", async () => {
            (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
            (prisma.order.count as jest.Mock).mockResolvedValue(1);

            const result = await orderService.getUserOrders(
                mockUserId,
                mockPaginationParams
            );

            expect(result).toEqual({
                data: mockOrders,
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });
    });

    describe("updateOrderStatus", () => {
        it("should update order status successfully", async () => {
            const updatedOrder = {
                ...mockOrder,
                status: OrderStatus.PROCESSING,
            };
            (prisma.order.update as jest.Mock).mockResolvedValue(updatedOrder);

            const result = await orderService.updateOrderStatus(
                mockOrderId,
                OrderStatus.PROCESSING
            );

            expect(result).toEqual(updatedOrder);
            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: mockOrderId },
                data: { status: OrderStatus.PROCESSING },
            });
        });
    });

    describe("cancelOrder", () => {
        it("should cancel order and restore stock", async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder);
            (prisma.order.update as jest.Mock).mockResolvedValue({
                ...mockOrder,
                status: OrderStatus.CANCELLED,
            });

            const result = await orderService.cancelOrder(
                mockOrderId,
                mockUserId
            );

            expect(result.status).toBe(OrderStatus.CANCELLED);
            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: mockProductId },
                data: {
                    stock: {
                        increment: 2,
                    },
                },
            });
        });

        it("should throw error if order not found", async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(
                orderService.cancelOrder(mockOrderId, mockUserId)
            ).rejects.toThrow("Order not found or cannot be cancelled");
        });

        it("should throw error if order is not in pending status", async () => {
            const processingOrder = {
                ...mockOrder,
                status: OrderStatus.PROCESSING,
            };
            (prisma.order.findFirst as jest.Mock).mockImplementation((args) => {
                if (args.where.status === OrderStatus.PENDING) {
                    return null;
                }
                return processingOrder;
            });

            await expect(
                orderService.cancelOrder(mockOrderId, mockUserId)
            ).rejects.toThrow("Order not found or cannot be cancelled");
        });
    });
});
