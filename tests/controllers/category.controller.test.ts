import { CategoryController } from "@/controllers/category.controller";
import { CategoryService } from "@/services/category.service";
import { Request, Response } from "express";

jest.mock("@/services/category.service");

describe("CategoryController", () => {
    let categoryController: CategoryController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockCategoryService: jest.Mocked<CategoryService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockCategoryService =
            new CategoryService() as jest.Mocked<CategoryService>;
        (CategoryService as jest.Mock).mockImplementation(
            () => mockCategoryService
        );
        categoryController = new CategoryController();
    });

    describe("getAllCategories", () => {
        it("should return categories", async () => {
            const mockCategories = [
                {
                    id: "cat1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    name: "Cat1",
                    description: null,
                    image: null,
                    parentId: null,
                },
            ];
            mockCategoryService.getAllCategories.mockResolvedValue(
                mockCategories
            );
            await categoryController.getAllCategories(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockCategories);
        });
        it("should handle error", async () => {
            mockCategoryService.getAllCategories.mockRejectedValue(
                new Error("fail")
            );
            await categoryController.getAllCategories(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("getCategoryById", () => {
        it("should return category", async () => {
            const mockCategory = {
                id: "cat1",
                createdAt: new Date(),
                updatedAt: new Date(),
                name: "Cat1",
                description: null,
                image: null,
                parentId: null,
            };
            mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);
            mockRequest.params = { id: "cat1" };
            await categoryController.getCategoryById(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockCategory);
        });
        it("should handle error", async () => {
            mockCategoryService.getCategoryById.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "cat1" };
            await categoryController.getCategoryById(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("createCategory", () => {
        it("should create category", async () => {
            const mockCategory = {
                id: "cat1",
                createdAt: new Date(),
                updatedAt: new Date(),
                name: "Cat1",
                description: null,
                image: null,
                parentId: null,
            };
            mockCategoryService.createCategory.mockResolvedValue(mockCategory);
            mockRequest.body = { name: "Cat1" };
            await categoryController.createCategory(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockCategory);
        });
        it("should handle error", async () => {
            mockCategoryService.createCategory.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.body = { name: "Cat1" };
            await categoryController.createCategory(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("updateCategory", () => {
        it("should update category", async () => {
            const mockCategory = {
                id: "cat1",
                createdAt: new Date(),
                updatedAt: new Date(),
                name: "Cat1 Updated",
                description: null,
                image: null,
                parentId: null,
            };
            mockCategoryService.updateCategory.mockResolvedValue(mockCategory);
            mockRequest.params = { id: "cat1" };
            mockRequest.body = { name: "Cat1 Updated" };
            await categoryController.updateCategory(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockCategory);
        });
        it("should handle error", async () => {
            mockCategoryService.updateCategory.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "cat1" };
            mockRequest.body = { name: "Cat1 Updated" };
            await categoryController.updateCategory(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("deleteCategory", () => {
        it("should delete category", async () => {
            mockCategoryService.deleteCategory.mockResolvedValue(undefined);
            mockRequest.params = { id: "cat1" };
            await categoryController.deleteCategory(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Category deleted successfully",
            });
        });
        it("should handle error", async () => {
            mockCategoryService.deleteCategory.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "cat1" };
            await categoryController.deleteCategory(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});
