import { prisma } from "@/config/database";
import { Category } from "@prisma/client";
import { paginate, PaginationParams } from "@/utils/pagination";

export class CategoryService {
    //Create category
    async createCategory(data: {
        name: string;
        description?: string;
        image?: string;
        parentId?: string;
    }): Promise<Category> {
        //Check if name is unique
        const existingCategory = await prisma.category.findUnique({
            where: { name: data.name },
        });

        if (existingCategory) {
            throw new Error("Category name already exists.");
        }

        //If parentId is provided, verify it exits
        if (data.parentId) {
            const parent = await prisma.category.findUnique({
                where: { id: data.parentId },
            });

            if (!parent) {
                throw new Error(`Parent category not found`);
            }
        }

        return prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                image: data.image,
                parentId: data.parentId,
            },
        });
    }

    //Get category by id
    async getCategoryById(id: string): Promise<Category> {
        const category = await prisma.category.findUnique({
            where: { id },
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

        if (!category) {
            throw new Error("Category not found");
        }

        return category;
    }

    //Get all categories
    async getAllCategories(): Promise<Category[]> {
        return prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
            },
        });
    }

    //Update category
    async updateCategory(
        id: string,
        data: {
            name?: string;
            description?: string;
            image?: string;
            parentId?: string;
        }
    ): Promise<Category> {
        //Check if category exists
        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new Error("Category not found");
        }

        //If name is updated, check uniqueness
        if (data.name && data.name !== category.name) {
            const existingCategory = await prisma.category.findUnique({
                where: { name: data.name },
            });

            if (existingCategory) {
                throw new Error(`Category name already exits;`);
            }
        }

        //If parentId is being updated, verify it exists and check for circular reference
        if (data.parentId) {
            if (data.parentId === id) {
                throw new Error("Category cannot be its own parent");
            }

            const parent = await prisma.category.findUnique({
                where: { id: data.parentId },
            });

            if (!parent) {
                throw new Error(`Parent category not found`);
            }

            //Check for circular reference
            const isCircular = await this.checkCircularReference(
                id,
                data.parentId
            );
            if (isCircular) {
                throw new Error(
                    `Circular reference detected in category hierarchy`
                );
            }
        }
        return prisma.category.update({
            where: { id },
            data,
        });
    }

    //Delete category
    async deleteCategory(id: string): Promise<void> {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
            },
        });

        if (!category) {
            throw new Error(`Category not found`);
        }

        if (category._count.products > 0) {
            throw new Error(`Cannot delete category with associated products`);
        }

        if (category._count.children > 0) {
            throw new Error(`Cannot delete category with subcategories`);
        }

        await prisma.category.delete({
            where: { id },
        });
    }

    //Get parent category
    async getParentCategories(): Promise<Category[]> {
        return prisma.category.findMany({
            where: { parentId: null },
            include: {
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
            },
        });
    }

    //Get subcategories
    async getSubcategories(parentId: string): Promise<Category[]> {
        return prisma.category.findMany({
            where: { parentId },
            include: {
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
            },
        });
    }

    //Get category tree
    async getCategoryTree(): Promise<Category[]> {
        const categories = await prisma.category.findMany({
            include: {
                children: {
                    include: {
                        children: true,
                    },
                },
            },
        });

        return categories.filter((category) => !category.parentId);
    }

    //Get category products
    async getCategoryProducts(id: string, params: PaginationParams) {
        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new Error(`Category not found`);
        }

        return paginate(
            (skip, take) =>
                prisma.product.findMany({
                    where: {
                        categoryId: id,
                        isActive: true,
                    },
                    skip,
                    take,
                    include: {
                        seller: {
                            select: {
                                businessName: true,
                            },
                        },
                    },
                }),
            () =>
                prisma.product.count({
                    where: {
                        categoryId: id,
                        isActive: true,
                    },
                }),
            params
        );
    }

    //Search categories
    async searchCategories(query: string): Promise<Category[]> {
        return prisma.category.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
    }

    //Helper to check circular reference
    private async checkCircularReference(
        categoryId: string,
        newParentId: string
    ): Promise<boolean> {
        let currentId: string | null = newParentId;
        const visited = new Set<string>();

        while (currentId) {
            if (currentId === categoryId) {
                return true;
            }

            if (visited.has(currentId)) {
                return true;
            }

            visited.add(currentId);

            const parent: { parentId: string | null } | null =
                await prisma.category.findUnique({
                    where: { id: currentId },
                    select: { parentId: true },
                });

            if (!parent) {
                break;
            }
            currentId = parent.parentId;
        }
        return false;
    }
}
