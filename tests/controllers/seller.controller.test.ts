import { SellerController } from "@/controllers/seller.controller";
import { SellerService } from "@/services/seller.service";
import { Request, Response } from "express";

jest.mock("@/services/seller.service");

describe("SellerController", () => {
    let sellerController: SellerController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockSellerService: jest.Mocked<SellerService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockSellerService = new SellerService() as jest.Mocked<SellerService>;
        (SellerService as jest.Mock).mockImplementation(
            () => mockSellerService
        );
        sellerController = new SellerController();
    });

    describe("getSellers", () => {
        it("should return sellers", async () => {
            const mockSellers = [
                {
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
            ];
            mockSellerService.getAllSellers.mockResolvedValue(mockSellers);
            mockRequest.query = { page: "1", limit: "10" };
            await sellerController.getAllSellers(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockSellers);
        });
        it("should handle error", async () => {
            mockSellerService.getAllSellers.mockRejectedValue(
                new Error("fail")
            );
            await sellerController.getAllSellers(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("getSeller", () => {
        it("should return seller", async () => {
            const mockSeller = {
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
            };
            mockSellerService.getSellerById.mockResolvedValue(mockSeller);
            mockRequest.params = { id: "s1" };
            await sellerController.getSellerById(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockSeller);
        });
        it("should handle error", async () => {
            mockSellerService.getSellerById.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "s1" };
            await sellerController.getSellerById(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("createSeller", () => {
        it("should create seller", async () => {
            const mockSeller = {
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
            };
            mockSellerService.createSellerProfile.mockResolvedValue(mockSeller);
            mockRequest.body = { name: "Seller1" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await sellerController.createSellerProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockSeller);
        });
        it("should handle error", async () => {
            mockSellerService.createSellerProfile.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.body = { name: "Seller1" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await sellerController.createSellerProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("updateSeller", () => {
        it("should update seller", async () => {
            const mockSeller = {
                id: "s1",
                name: "Seller1 Updated",
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
            };
            mockSellerService.updateSellerProfile.mockResolvedValue(mockSeller);
            mockRequest.params = { id: "s1" };
            mockRequest.body = { name: "Seller1 Updated" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await sellerController.updateSellerProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockSeller);
        });
        it("should handle error", async () => {
            mockSellerService.updateSellerProfile.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "s1" };
            mockRequest.body = { name: "Seller1 Updated" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await sellerController.updateSellerProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("deleteSeller", () => {
        it("should delete seller", async () => {
            mockSellerService.deleteSellerProfile.mockResolvedValue(undefined);
            mockRequest.params = { id: "s1" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await sellerController.deleteSellerProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Seller profile deleted successfully",
            });
        });
        it("should handle error", async () => {
            mockSellerService.deleteSellerProfile.mockRejectedValue(
                new Error("fail")
            );
            mockRequest.params = { id: "s1" };
            mockRequest.user = {
                userId: "u1",
                email: "seller@example.com",
                role: "SELLER",
            };
            await sellerController.deleteSellerProfile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});
