import { CartService } from "@/services/cart.service";
import { prisma } from "@/config/database";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        cart: {
            upsert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
        },
    },
}));

describe("CartService", () => {
    let cartService: CartService;
    const mockUserId = "user123";
    const mockProductId = "prod123";
    const mockProduct = {
        id: mockProductId,
        name: "Test Product",
        price: 99.99,
        stock: 100,
        isActive: true,
        category: {
            id: "cat123",
            name: "Electronics",
        },
        seller: {
            id: "seller123",
            businessName: "Test Store",
        },
    };

    const mockCartItem = {
        userId: mockUserId,
        productId: mockProductId,
        quantity: 2,
        product: mockProduct,
    };

    beforeEach(() => {
        cartService = new CartService();
        jest.clearAllMocks();
    });

    describe("addCart", () => {
        it("should add new item to cart", async () => {
            (prisma.cart.upsert as jest.Mock).mockResolvedValue(mockCartItem);

            const result = await cartService.addCart(
                mockUserId,
                mockProductId,
                2
            );

            expect(result).toEqual(mockCartItem);
            expect(prisma.cart.upsert).toHaveBeenCalledWith({
                where: {
                    userId_productId: {
                        userId: mockUserId,
                        productId: mockProductId,
                    },
                },
                update: {
                    quantity: { increment: 2 },
                },
                create: {
                    userId: mockUserId,
                    productId: mockProductId,
                    quantity: 2,
                },
                include: {
                    product: true,
                },
            });
        });

        it("should increment quantity for existing item", async () => {
            const existingItem = { ...mockCartItem, quantity: 1 };
            const updatedItem = { ...mockCartItem, quantity: 3 };
            (prisma.cart.upsert as jest.Mock).mockResolvedValue(updatedItem);

            const result = await cartService.addCart(
                mockUserId,
                mockProductId,
                2
            );

            expect(result).toEqual(updatedItem);
            expect(prisma.cart.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: {
                        quantity: { increment: 2 },
                    },
                })
            );
        });
    });

    describe("updateCartItem", () => {
        it("should update item quantity", async () => {
            const updatedItem = { ...mockCartItem, quantity: 3 };
            (prisma.cart.update as jest.Mock).mockResolvedValue(updatedItem);

            const result = await cartService.updateCartItem(
                mockUserId,
                mockProductId,
                3
            );

            expect(result).toEqual(updatedItem);
            expect(prisma.cart.update).toHaveBeenCalledWith({
                where: {
                    userId_productId: {
                        userId: mockUserId,
                        productId: mockProductId,
                    },
                },
                data: { quantity: 3 },
                include: {
                    product: true,
                },
            });
        });

        it("should remove item when quantity is 0", async () => {
            (prisma.cart.delete as jest.Mock).mockResolvedValue(mockCartItem);

            const result = await cartService.updateCartItem(
                mockUserId,
                mockProductId,
                0
            );

            expect(result).toEqual(mockCartItem);
            expect(prisma.cart.delete).toHaveBeenCalledWith({
                where: {
                    userId_productId: {
                        userId: mockUserId,
                        productId: mockProductId,
                    },
                },
            });
        });
    });

    describe("getCart", () => {
        const mockCartItems = [mockCartItem];

        it("should return user's cart items", async () => {
            (prisma.cart.findMany as jest.Mock).mockResolvedValue(
                mockCartItems
            );

            const result = await cartService.getCart(mockUserId);

            expect(result).toEqual(mockCartItems);
            expect(prisma.cart.findMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
                include: {
                    product: {
                        include: {
                            category: true,
                            seller: true,
                        },
                    },
                },
            });
        });
    });

    describe("getCartTotal", () => {
        const mockCartItems = [
            { ...mockCartItem, quantity: 2 },
            { ...mockCartItem, productId: "prod456", quantity: 1 },
        ];

        it("should calculate total cart value", async () => {
            (prisma.cart.findMany as jest.Mock).mockResolvedValue(
                mockCartItems
            );

            const result = await cartService.getCartTotal(mockUserId);

            expect(result).toBe(99.99 * 3); // 2 items of first product + 1 item of second product
        });
    });

    describe("validateCart", () => {
        const mockCartItems = [mockCartItem];

        it("should validate cart items", async () => {
            (prisma.cart.findMany as jest.Mock).mockResolvedValue(
                mockCartItems
            );
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct
            );

            const result = await cartService.validateCart(mockUserId);

            expect(result).toEqual([
                {
                    productId: mockProductId,
                    valid: true,
                },
            ]);
        });

        it("should detect invalid items", async () => {
            const inactiveProduct = { ...mockProduct, isActive: false };
            (prisma.cart.findMany as jest.Mock).mockResolvedValue(
                mockCartItems
            );
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                inactiveProduct
            );

            const result = await cartService.validateCart(mockUserId);

            expect(result).toEqual([
                {
                    productId: mockProductId,
                    valid: false,
                    reason: "Product not available",
                },
            ]);
        });

        it("should detect insufficient stock", async () => {
            const lowStockProduct = { ...mockProduct, stock: 1 };
            (prisma.cart.findMany as jest.Mock).mockResolvedValue(
                mockCartItems
            );
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                lowStockProduct
            );

            const result = await cartService.validateCart(mockUserId);

            expect(result).toEqual([
                {
                    productId: mockProductId,
                    valid: false,
                    reason: "Insufficient stock",
                },
            ]);
        });
    });
});
