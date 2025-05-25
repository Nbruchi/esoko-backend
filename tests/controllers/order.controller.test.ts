import { OrderController } from "@/controllers/order.controller";
import { OrderService } from "@/services/order.service";
import { Request, Response } from "express";
import {
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
    UserRole,
} from "@prisma/client";

jest.mock("@/services/order.service");

describe("OrderController", () => {
    let orderController: OrderController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockOrderService: jest.Mocked<OrderService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockOrderService = new OrderService() as jest.Mocked<OrderService>;
        (OrderService as jest.Mock).mockImplementation(() => mockOrderService);
        orderController = new OrderController();
    });

    describe("getUserOrders", () => {
        it("should return orders", async () => {
            const mockOrders = [
                {
                    id: "o1",
                    userId: "user1",
                    status: OrderStatus.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    addressId: "addr1",
                    totalAmount: 100,
                    paymentStatus: PaymentStatus.PENDING,
                    paymentMethod: PaymentMethod.CARD,
                    paymentIntentId: null,
                    items: [
                        {
                            id: "oi1",
                            orderId: "o1",
                            productId: "p1",
                            product: {
                                id: "p1",
                                name: "Test Product",
                                description: "Test Description",
                                price: 100,
                                stock: 10,
                                categoryId: "c1",
                                sellerId: "s1",
                                images: [],
                                isActive: true,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                            quantity: 1,
                            price: 100,
                        },
                    ],
                },
            ];
            mockOrderService.getUserOrders.mockResolvedValue({
                data: mockOrders,
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
                role: UserRole.CUSTOMER,
            };
            mockRequest.query = { page: "1", limit: "10" };
            await orderController.getUserOrders(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                data: mockOrders,
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });
        it("should handle error", async () => {
            mockOrderService.getUserOrders.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.query = { page: "1", limit: "10" };
            await orderController.getUserOrders(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("getOrderById", () => {
        it("should return order", async () => {
            const mockOrder = {
                id: "o1",
                userId: "user1",
                status: OrderStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
                addressId: "addr1",
                totalAmount: 100,
                paymentStatus: PaymentStatus.PENDING,
                paymentMethod: PaymentMethod.CARD,
                paymentIntentId: null,
                items: [
                    {
                        id: "oi1",
                        orderId: "o1",
                        productId: "p1",
                        product: {
                            id: "p1",
                            name: "Test Product",
                            description: "Test Description",
                            price: 100,
                            stock: 10,
                            categoryId: "c1",
                            sellerId: "s1",
                            images: [],
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        quantity: 1,
                        price: 100,
                    },
                ],
            };
            mockOrderService.getOrderById.mockResolvedValue(mockOrder);
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.params = { id: "o1" };
            await orderController.getOrderById(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockOrder);
        });
        it("should handle error", async () => {
            mockOrderService.getOrderById.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.params = { id: "o1" };
            await orderController.getOrderById(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("createOrder", () => {
        it("should create order", async () => {
            const mockOrder = {
                id: "o1",
                userId: "user1",
                status: OrderStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
                addressId: "addr1",
                totalAmount: 100,
                paymentStatus: PaymentStatus.PENDING,
                paymentMethod: PaymentMethod.CARD,
                paymentIntentId: null,
                items: [
                    {
                        id: "oi1",
                        orderId: "o1",
                        productId: "p1",
                        product: {
                            id: "p1",
                            name: "Test Product",
                            description: "Test Description",
                            price: 100,
                            stock: 10,
                            categoryId: "c1",
                            sellerId: "s1",
                            images: [],
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        quantity: 1,
                        price: 100,
                    },
                ],
            };
            mockOrderService.createOrder.mockResolvedValue(mockOrder);
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = {
                items: [],
                addressId: "addr1",
                paymentMethod: PaymentMethod.CARD,
            };
            await orderController.createOrder(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockOrder);
        });
        it("should handle error", async () => {
            mockOrderService.createOrder.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = {
                items: [],
                addressId: "addr1",
                paymentMethod: PaymentMethod.CARD,
            };
            await orderController.createOrder(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("updateOrderStatus", () => {
        it("should update order status", async () => {
            const mockOrder = {
                id: "o1",
                userId: "user1",
                status: OrderStatus.SHIPPED,
                createdAt: new Date(),
                updatedAt: new Date(),
                addressId: "addr1",
                totalAmount: 100,
                paymentStatus: PaymentStatus.PENDING,
                paymentMethod: PaymentMethod.CARD,
                paymentIntentId: null,
            };
            mockOrderService.updateOrderStatus.mockResolvedValue(mockOrder);
            mockRequest.params = { id: "o1" };
            mockRequest.body = { status: OrderStatus.SHIPPED };
            await orderController.updateOrderStatus(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockOrder);
        });
        it("should handle error", async () => {
            mockOrderService.updateOrderStatus.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "o1" };
            mockRequest.body = { status: OrderStatus.SHIPPED };
            await orderController.updateOrderStatus(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("cancelOrder", () => {
        it("should cancel order", async () => {
            const mockOrder = {
                id: "o1",
                userId: "user1",
                status: OrderStatus.CANCELLED,
                createdAt: new Date(),
                updatedAt: new Date(),
                addressId: "addr1",
                totalAmount: 100,
                paymentStatus: PaymentStatus.PENDING,
                paymentMethod: PaymentMethod.CARD,
                paymentIntentId: null,
                items: [
                    {
                        id: "oi1",
                        orderId: "o1",
                        productId: "p1",
                        product: {
                            id: "p1",
                            name: "Test Product",
                            description: "Test Description",
                            price: 100,
                            stock: 10,
                            categoryId: "c1",
                            sellerId: "s1",
                            images: [],
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        quantity: 1,
                        price: 100,
                    },
                ],
            };
            mockOrderService.cancelOrder.mockResolvedValue(mockOrder);
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.params = { orderId: "o1" };
            await orderController.cancelOrder(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockOrder);
        });
        it("should handle error", async () => {
            mockOrderService.cancelOrder.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.params = { orderId: "o1" };
            await orderController.cancelOrder(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});
