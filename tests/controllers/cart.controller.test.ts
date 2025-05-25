import { CartController } from "@/controllers/cart.controller";
import { CartService } from "@/services/cart.service";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";

jest.mock("@/services/cart.service");

describe("CartController", () => {
    let cartController: CartController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockCartService: jest.Mocked<CartService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockCartService = new CartService() as jest.Mocked<CartService>;
        (CartService as jest.Mock).mockImplementation(() => mockCartService);
        cartController = new CartController();
    });

    describe("getCart", () => {
        it("should return cart", async () => {
            const mockCart = [
                {
                    id: "cart1",
                    userId: "user1",
                    productId: "p1",
                    quantity: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    product: {
                        id: "p1",
                        name: "Test Product",
                        description: "Test Description",
                        price: 99.99,
                        stock: 100,
                        categoryId: "cat1",
                        sellerId: "seller1",
                        images: [],
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        category: {
                            id: "cat1",
                            name: "Test Category",
                            description: null,
                            image: null,
                            parentId: null,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        seller: {
                            id: "seller1",
                            userId: "user1",
                            businessName: "Test Store",
                            description: null,
                            logo: null,
                            isVerified: false,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    },
                },
            ];
            mockCartService.getCart.mockResolvedValue(mockCart);
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            await cartController.getCart(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockCart);
        });
        it("should handle error", async () => {
            mockCartService.getCart.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            await cartController.getCart(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("addToCart", () => {
        it("should add item to cart", async () => {
            const mockCart = {
                id: "cart1",
                userId: "user1",
                productId: "p1",
                quantity: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                product: {
                    id: "p1",
                    name: "Test Product",
                    description: "Test Description",
                    price: 99.99,
                    stock: 100,
                    categoryId: "cat1",
                    sellerId: "seller1",
                    images: [],
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };
            mockCartService.addCart.mockResolvedValue(mockCart);
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = { productId: "p1", quantity: 1 };
            await cartController.addToCart(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockCart);
        });
        it("should handle error", async () => {
            mockCartService.addCart.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = { productId: "p1", quantity: 1 };
            await cartController.addToCart(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("updateCartItem", () => {
        it("should update cart item", async () => {
            const mockCart = {
                id: "cart1",
                userId: "user1",
                productId: "p1",
                quantity: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                product: {
                    id: "p1",
                    name: "Test Product",
                    description: "Test Description",
                    price: 99.99,
                    stock: 100,
                    categoryId: "cat1",
                    sellerId: "seller1",
                    images: [],
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };
            mockCartService.updateCartItem.mockResolvedValue(mockCart);
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.params = { productId: "p1" };
            mockRequest.body = { quantity: 2 };
            await cartController.updateCartItem(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockCart);
        });
        it("should handle error", async () => {
            mockCartService.updateCartItem.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = { productId: "p1", quantity: 2 };
            await cartController.updateCartItem(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("removeFromCart", () => {
        it("should remove item from cart", async () => {
            const mockCart = {
                id: "cart1",
                userId: "user1",
                productId: "p1",
                quantity: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockCartService.removeFromCart.mockResolvedValue(mockCart);
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.params = { productId: "p1" };
            await cartController.removeFromCart(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Item removed from cart",
            });
        });
        it("should handle error", async () => {
            mockCartService.removeFromCart.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            mockRequest.body = { productId: "p1" };
            await cartController.removeFromCart(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("clearCart", () => {
        it("should clear cart", async () => {
            const mockCart = { count: 1 };
            mockCartService.clearCart.mockResolvedValue(mockCart);
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            await cartController.clearCart(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Cart cleared successfully",
            });
        });
        it("should handle error", async () => {
            mockCartService.clearCart.mockRejectedValue(new Error("fail"));
            mockRequest.user = {
                userId: "user1",
                email: "test@example.com",
                role: UserRole.CUSTOMER,
            };
            await cartController.clearCart(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});
