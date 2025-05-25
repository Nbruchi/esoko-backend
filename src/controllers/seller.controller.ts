import { Request, Response } from "express";
import { SellerService } from "@/services/seller.service";

export class SellerController {
    private sellerService: SellerService;

    constructor() {
        this.sellerService = new SellerService();
    }

    // Create seller profile
    async createSellerProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { businessName, description, logo } = req.body;
            const seller = await this.sellerService.createSellerProfile({
                userId,
                businessName,
                description,
                logo,
            });
            res.status(201).json(seller);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get seller by ID
    async getSellerById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const seller = await this.sellerService.getSellerById(id);
            if (!seller) {
                return res.status(404).json({ message: "Seller not found" });
            }
            res.json(seller);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get seller by user ID
    async getSellerByUserId(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const seller = await this.sellerService.getSellerByUserId(userId);
            if (!seller) {
                return res
                    .status(404)
                    .json({ message: "Seller profile not found" });
            }
            res.json(seller);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get all sellers
    async getAllSellers(req: Request, res: Response) {
        try {
            const { page, limit } = req.query;
            const sellers = await this.sellerService.getAllSellers({
                skip: page ? (Number(page) - 1) * Number(limit) : undefined,
                take: limit ? Number(limit) : undefined,
            });
            res.json(sellers);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update seller profile
    async updateSellerProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { id } = req.params;
            const { businessName, description, logo } = req.body;
            const seller = await this.sellerService.updateSellerProfile(id, {
                businessName,
                description,
                logo,
            });
            res.json(seller);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Delete seller profile
    async deleteSellerProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { id } = req.params;
            await this.sellerService.deleteSellerProfile(id);
            res.json({ message: "Seller profile deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Verify seller
    async verifySeller(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const seller = await this.sellerService.verifySeller(id);
            res.json(seller);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get seller's products
    async getSellerProducts(req: Request, res: Response) {
        try {
            const { sellerId } = req.params;
            const products =
                await this.sellerService.getSellerProducts(sellerId);
            res.json(products);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get seller statistics
    async getSellerStats(req: Request, res: Response) {
        try {
            const { sellerId } = req.params;
            const stats = await this.sellerService.getSellerStats(sellerId);
            res.json(stats);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
