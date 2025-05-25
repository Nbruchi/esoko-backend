import { Request, Response } from "express";
import { CartService } from "@/services/cart.service";

export class CartController {
    private cartService: CartService;

    constructor() {
        this.cartService = new CartService();
    }

    // Add item to cart
    async addToCart(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { productId, quantity } = req.body;
            const cart = await this.cartService.addCart(
                userId,
                productId,
                quantity
            );
            res.status(201).json(cart);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update cart item quantity
    async updateCartItem(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { productId } = req.params;
            const { quantity } = req.body;
            const cart = await this.cartService.updateCartItem(
                userId,
                productId,
                quantity
            );
            res.json(cart);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Remove item from cart
    async removeFromCart(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const { productId } = req.params;
            await this.cartService.removeFromCart(userId, productId);
            res.json({ message: "Item removed from cart" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get user's cart
    async getCart(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const cart = await this.cartService.getCart(userId);
            res.json(cart);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Clear cart
    async clearCart(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            await this.cartService.clearCart(userId);
            res.json({ message: "Cart cleared successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get cart total
    async getCartTotal(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const total = await this.cartService.getCartTotal(userId);
            res.json({ total });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Validate cart items
    async validateCart(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const validationResults =
                await this.cartService.validateCart(userId);
            res.json(validationResults);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
