import { ProductService } from "@/services/product.service";
import { prisma } from "@/config/database";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        product: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        seller: {
            findUnique: jest.fn(),
        },
    },
}));

describe("ProductService", () => {
    let productService: ProductService;
    const mockProduct = {
        id: "product123",
        sellerId: "seller123",
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        stock: 100,
        images: ["image1.jpg", "image2.jpg"],
        category: "Electronics",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockSeller = {
        id: "seller123",
        userId: "user123",
        businessName: "Test Business",
        isVerified: true,
    };

    beforeEach(() => {
        productService = new ProductService();
        jest.clearAllMocks();
    });

    describe("createProduct", () => {
        const mockProductData = {
            sellerId: "seller123",
            name: "Test Product",
            description: "Test Description",
            price: 99.99,
            stock: 100,
            images: ["image1.jpg", "image2.jpg"],
            categoryId: "cat123",
        };

        it("should create a product successfully", async () => {
            (prisma.seller.findUnique as jest.Mock).mockResolvedValue(
                mockSeller
            );
            (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

            const result = await productService.createProduct(mockProductData);

            expect(result).toEqual(mockProduct);
            expect(prisma.product.create).toHaveBeenCalledWith({
                data: mockProductData,
            });
        });

        it("should throw error if seller not found", async () => {
            (prisma.seller.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                productService.createProduct(mockProductData)
            ).rejects.toThrow("Seller not found");
        });

        it("should throw error if seller is not verified", async () => {
            (prisma.seller.findUnique as jest.Mock).mockResolvedValue({
                ...mockSeller,
                isVerified: false,
            });

            await expect(
                productService.createProduct(mockProductData)
            ).rejects.toThrow("Seller is not verified");
        });
    });

    describe("getProduct", () => {
        it("should return product if found", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct
            );

            const result = await productService.getProductById(mockProduct.id);

            expect(result).toEqual(mockProduct);
        });

        it("should throw error if product not found", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                productService.getProductById(mockProduct.id)
            ).rejects.toThrow("Product not found");
        });
    });

    describe("getProducts", () => {
        const mockProducts = [mockProduct];
        const mockFilters = {
            categoryId: "cat123",
            minPrice: 50,
            maxPrice: 150,
            search: "test",
        };

        it("should return filtered products", async () => {
            (prisma.product.findMany as jest.Mock).mockResolvedValue(
                mockProducts
            );
            (prisma.product.count as jest.Mock).mockResolvedValue(1);

            const result = await productService.getProducts(mockFilters);

            expect(result).toEqual({
                data: mockProducts,
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });
    });

    describe("updateProduct", () => {
        const mockUpdateData = {
            name: "Updated Product",
            price: 149.99,
        };

        it("should update product successfully", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct
            );
            (prisma.product.update as jest.Mock).mockResolvedValue({
                ...mockProduct,
                ...mockUpdateData,
            });

            const result = await productService.updateProduct(
                mockProduct.id,
                mockProduct.sellerId,
                mockUpdateData
            );

            expect(result).toEqual({
                ...mockProduct,
                ...mockUpdateData,
            });
        });

        it("should throw error if product not found", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                productService.updateProduct(
                    mockProduct.id,
                    mockProduct.sellerId,
                    mockUpdateData
                )
            ).rejects.toThrow("Product not found");
        });
    });

    describe("deleteProduct", () => {
        it("should delete product successfully", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct
            );
            (prisma.product.update as jest.Mock).mockResolvedValue({
                ...mockProduct,
                isActive: false,
            });

            await productService.softDeleteProduct(
                mockProduct.id,
                mockProduct.sellerId
            );

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: mockProduct.id, sellerId: mockProduct.sellerId },
                data: { isActive: false },
            });
        });

        it("should throw error if product not found", async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                productService.softDeleteProduct(
                    mockProduct.id,
                    mockProduct.sellerId
                )
            ).rejects.toThrow("Product not found");
        });
    });
});
