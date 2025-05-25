import { ProductController } from "@/controllers/product.controller";
import { ProductService } from "@/services/product.service";
import { Request, Response } from "express";

jest.mock("@/services/product.service");

describe("ProductController", () => {
    let productController: ProductController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockProductService: jest.Mocked<ProductService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockProductService =
            new ProductService() as jest.Mocked<ProductService>;
        (ProductService as jest.Mock).mockImplementation(
            () => mockProductService
        );
        productController = new ProductController();
    });

    describe("getProducts", () => {
        it("should return products", async () => {
            const mockProducts = [
                {
                    id: "p1",
                    name: "Product1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    description: "desc",
                    price: 100,
                    stock: 10,
                    category: {
                        id: "c1",
                        name: "Category1",
                        description: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        image: null,
                        parentId: null,
                    },
                    seller: {
                        id: "s1",
                        name: "Seller1",
                        description: null,
                        email: "seller@example.com",
                        phone: "1234567890",
                        address: null,
                        logo: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        userId: "u1",
                        isVerified: true,
                        businessName: "Seller Business",
                    },
                    sellerId: "s1",
                    categoryId: "c1",
                    images: [],
                    isActive: true,
                },
            ];
            mockProductService.getProducts.mockResolvedValue({
                data: mockProducts,
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
            mockRequest.query = { page: "1", limit: "10" };
            await productController.getProducts(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                data: mockProducts,
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });
        it("should handle error", async () => {
            mockProductService.getProducts.mockRejectedValue(new Error("fail"));
            await productController.getProducts(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("getProduct", () => {
        it("should return product", async () => {
            const mockProduct = {
                id: "p1",
                name: "Product1",
                createdAt: new Date(),
                updatedAt: new Date(),
                description: "desc",
                price: 100,
                stock: 10,
                category: {
                    id: "c1",
                    name: "Category1",
                    description: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    parentId: null,
                },
                seller: {
                    id: "s1",
                    name: "Seller1",
                    description: null,
                    email: "seller@example.com",
                    phone: "1234567890",
                    address: null,
                    logo: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: "u1",
                    isVerified: true,
                    businessName: "Seller Business",
                },
                sellerId: "s1",
                categoryId: "c1",
                images: [],
                isActive: true,
            };
            mockProductService.getProductById.mockResolvedValue(mockProduct);
            mockRequest.params = { id: "p1" };
            await productController.getProductById(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
        });
        it("should handle error", async () => {
            mockProductService.getProductById.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "p1" };
            await productController.getProductById(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("createProduct", () => {
        it("should create product", async () => {
            const mockProduct = {
                id: "p1",
                name: "Product1",
                createdAt: new Date(),
                updatedAt: new Date(),
                description: "desc",
                price: 100,
                stock: 10,
                category: {
                    id: "c1",
                    name: "Category1",
                    description: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    parentId: null,
                },
                seller: {
                    id: "s1",
                    name: "Seller1",
                    description: null,
                    email: "seller@example.com",
                    phone: "1234567890",
                    address: null,
                    logo: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: "u1",
                    isVerified: true,
                    businessName: "Seller Business",
                },
                sellerId: "s1",
                categoryId: "c1",
                images: [],
                isActive: true,
            };
            mockProductService.createProduct.mockResolvedValue(mockProduct);
            mockRequest.body = { name: "Product1" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await productController.createProduct(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
        });
        it("should handle error", async () => {
            mockProductService.createProduct.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.body = { name: "Product1" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await productController.createProduct(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("updateProduct", () => {
        it("should update product", async () => {
            const mockProduct = {
                id: "p1",
                name: "Product1 Updated",
                createdAt: new Date(),
                updatedAt: new Date(),
                description: "desc",
                price: 100,
                stock: 10,
                category: {
                    id: "c1",
                    name: "Category1",
                    description: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    parentId: null,
                },
                seller: {
                    id: "s1",
                    name: "Seller1",
                    description: null,
                    email: "seller@example.com",
                    phone: "1234567890",
                    address: null,
                    logo: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: "u1",
                    isVerified: true,
                    businessName: "Seller Business",
                },
                sellerId: "s1",
                categoryId: "c1",
                images: [],
                isActive: true,
            };
            mockProductService.updateProduct.mockResolvedValue(mockProduct);
            mockRequest.params = { id: "p1" };
            mockRequest.body = { name: "Product1 Updated" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await productController.updateProduct(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
        });
        it("should handle error", async () => {
            mockProductService.updateProduct.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "p1" };
            mockRequest.body = { name: "Product1 Updated" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await productController.updateProduct(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("deleteProduct", () => {
        it("should delete product", async () => {
            const mockProducts = [
                {
                    id: "p1",
                    name: "Product1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    description: "desc",
                    price: 100,
                    stock: 10,
                    category: {
                        id: "c1",
                        name: "Category1",
                        description: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        image: null,
                        parentId: null,
                    },
                    seller: {
                        id: "s1",
                        name: "Seller1",
                        description: null,
                        email: "seller@example.com",
                        phone: "1234567890",
                        address: null,
                        logo: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        userId: "u1",
                        isVerified: true,
                        businessName: "Seller Business",
                    },
                    sellerId: "s1",
                    categoryId: "c1",
                    images: [],
                    isActive: true,
                },
            ];
            const mockProduct = mockProducts[0];
            mockProductService.softDeleteProduct.mockResolvedValue(mockProduct);
            mockRequest.params = { id: "p1" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await productController.softDeleteProduct(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
        });
        it("should handle error", async () => {
            const mockProducts = [
                {
                    id: "p1",
                    name: "Product1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    description: "desc",
                    price: 100,
                    stock: 10,
                    category: {
                        id: "c1",
                        name: "Category1",
                        description: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        image: null,
                        parentId: null,
                    },
                    seller: {
                        id: "s1",
                        name: "Seller1",
                        description: null,
                        email: "seller@example.com",
                        phone: "1234567890",
                        address: null,
                        logo: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        userId: "u1",
                        isVerified: true,
                        businessName: "Seller Business",
                    },
                    sellerId: "s1",
                    categoryId: "c1",
                    images: [],
                    isActive: true,
                },
            ];
            const mockProduct = mockProducts[0];
            mockProductService.softDeleteProduct.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "p1" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await productController.softDeleteProduct(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});
