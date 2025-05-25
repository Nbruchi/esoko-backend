import { Request, Response } from "express";
import { CategoryService } from "@/services/category.service";

export class CategoryController {
    private categoryService: CategoryService;

    constructor() {
        this.categoryService = new CategoryService();
    }

    // Create category
    async createCategory(req: Request, res: Response) {
        try {
            const category = await this.categoryService.createCategory(
                req.body
            );
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get category by ID
    async getCategoryById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const category = await this.categoryService.getCategoryById(id);
            res.json(category);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get all categories
    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await this.categoryService.getAllCategories();
            res.json(categories);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update category
    async updateCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const category = await this.categoryService.updateCategory(
                id,
                req.body
            );
            res.json(category);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Delete category
    async deleteCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.categoryService.deleteCategory(id);
            res.json({ message: "Category deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get parent categories
    async getParentCategories(req: Request, res: Response) {
        try {
            const categories = await this.categoryService.getParentCategories();
            res.json(categories);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get subcategories
    async getSubcategories(req: Request, res: Response) {
        try {
            const { parentId } = req.params;
            const categories =
                await this.categoryService.getSubcategories(parentId);
            res.json(categories);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get category tree
    async getCategoryTree(req: Request, res: Response) {
        try {
            const categories = await this.categoryService.getCategoryTree();
            res.json(categories);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get category products
    async getCategoryProducts(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { page, limit } = req.query;
            const products = await this.categoryService.getCategoryProducts(
                id,
                {
                    page: Number(page) || 1,
                    limit: Number(limit) || 10,
                }
            );
            res.json(products);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Search categories
    async searchCategories(req: Request, res: Response) {
        try {
            const { query } = req.query;
            if (!query || typeof query !== "string") {
                return res
                    .status(400)
                    .json({ message: "Search query is required" });
            }
            const categories =
                await this.categoryService.searchCategories(query);
            res.json(categories);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
