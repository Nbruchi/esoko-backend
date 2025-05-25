import { Request, Response } from "express";
import { UserService } from "@/services/user.service";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    // Get user profile
    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const user = await this.userService.getUserProfile(userId);
            res.json(user);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update user profile
    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const user = await this.userService.updateUserProfile(
                userId,
                req.body
            );
            res.json(user);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update user settings
    async updateSettings(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const settings = await this.userService.updateUserSettings(
                userId,
                req.body
            );
            res.json(settings);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update notification preferences
    async updateNotificationPreferences(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const preferences =
                await this.userService.updateNotificationPreferences(
                    userId,
                    req.body
                );
            res.json(preferences);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get user addresses
    async getAddresses(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const addresses = await this.userService.getUserAddress(userId);
            res.json(addresses);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Add address
    async addAddress(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const address = await this.userService.addAddress(userId, req.body);
            res.status(201).json(address);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update address
    async updateAddress(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const addressId = req.params.addressId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const address = await this.userService.updateAddress(
                userId,
                addressId,
                req.body
            );
            res.json(address);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Delete address
    async deleteAddress(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const addressId = req.params.addressId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            await this.userService.deleteAddress(userId, addressId);
            res.json({ message: "Address deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Set default address
    async setDefaultAddress(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const addressId = req.params.addressId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const address = await this.userService.setDefaultAddress(
                userId,
                addressId
            );
            res.json(address);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get user statistics
    async getUserStatistics(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const stats = await this.userService.getUserStatistics(userId);
            res.json(stats);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get user activity
    async getUserActivity(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const activity = await this.userService.getUserActivity(userId);
            res.json(activity);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get user behavior analytics
    async getUserBehaviorAnalytics(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            const analytics =
                await this.userService.getUserBehaviorAnalytics(userId);
            res.json(analytics);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Delete account
    async deleteAccount(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }
            await this.userService.deleteAccount(userId);
            res.json({ message: "Account deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
