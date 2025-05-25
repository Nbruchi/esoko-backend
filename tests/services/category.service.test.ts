import { CategoryService } from "@/services/category.service";
import { prisma } from "@/config/database";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        category: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe("CategoryService", () => {
    let categoryService: CategoryService;
    const mockCategory = {
        id: "cat123",
        name: "Electronics",
        description: "Electronic devices and accessories",
        image: "electronics.jpg",
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        categoryService = new CategoryService();
        jest.clearAllMocks();
    });

    describe("createCategory", () => {
        const mockCategoryData = {
            name: "Electronics",
            description: "Electronic devices and accessories",
            image: "electronics.jpg",
        };

        it("should create a category successfully", async () => {
            (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.category.create as jest.Mock).mockResolvedValue(
                mockCategory
            );

            const result =
                await categoryService.createCategory(mockCategoryData);

            expect(result).toEqual(mockCategory);
            expect(prisma.category.create).toHaveBeenCalledWith({
                data: mockCategoryData,
            });
        });

        it("should throw error if category name already exists", async () => {
            (prisma.category.findUnique as jest.Mock).mockResolvedValue(
                mockCategory
            );

            await expect(
                categoryService.createCategory(mockCategoryData)
            ).rejects.toThrow("Category name already exists.");
        });

        it("should throw error if parent category not found", async () => {
            const dataWithParent = {
                ...mockCategoryData,
                parentId: "parent123",
            };
            (prisma.category.findUnique as jest.Mock)
                .mockResolvedValueOnce(null) // First call for name check
                .mockResolvedValueOnce(null); // Second call for parent check

            await expect(
                categoryService.createCategory(dataWithParent)
            ).rejects.toThrow("Parent category not found");
        });
    });

    describe("getCategoryById", () => {
        const mockCategoryWithRelations = {
            ...mockCategory,
            parent: null,
            children: [],
            products: [
                {
                    id: "prod123",
                    name: "Smartphone",
                    price: 999.99,
                    images: ["phone.jpg"],
                },
            ],
        };

        it("should return category if found", async () => {
            (prisma.category.findUnique as jest.Mock).mockResolvedValue(
                mockCategoryWithRelations
            );

            const result = await categoryService.getCategoryById(
                mockCategory.id
            );

            expect(result).toEqual(mockCategoryWithRelations);
            expect(prisma.category.findUnique).toHaveBeenCalledWith({
                where: { id: mockCategory.id },
                include: {
                    parent: true,
                    children: true,
                    products: {
                        where: { isActive: true },
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            images: true,
                        },
                    },
                },
            });
        });

        it("should throw error if category not found", async () => {
            (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                categoryService.getCategoryById(mockCategory.id)
            ).rejects.toThrow("Category not found");
        });
    });
});
