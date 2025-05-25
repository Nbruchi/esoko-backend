import { SellerService } from "@/services/seller.service";
import { prisma } from "@/config/database";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        seller: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
    },
}));

describe("SellerService", () => {
    let sellerService: SellerService;
    const mockSeller = {
        id: "seller123",
        userId: "user123",
        businessName: "Test Business",
        description: "Test Description",
        address: "Test Address",
        phoneNumber: "1234567890",
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUser = {
        id: "user123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
    };

    beforeEach(() => {
        sellerService = new SellerService();
        jest.clearAllMocks();
    });

    describe("createSeller", () => {
        const mockSellerData = {
            userId: "user123",
            businessName: "Test Business",
            description: "Test Description",
            address: "Test Address",
            phoneNumber: "1234567890",
        };

        it("should create a seller successfully", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (prisma.seller.create as jest.Mock).mockResolvedValue(mockSeller);

            const result =
                await sellerService.createSellerProfile(mockSellerData);

            expect(result).toEqual(mockSeller);
            expect(prisma.seller.create).toHaveBeenCalledWith({
                data: mockSellerData,
            });
        });

        it("should throw error if user not found", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                sellerService.createSellerProfile(mockSellerData)
            ).rejects.toThrow("User not found");
        });
    });

    describe("getSeller", () => {
        it("should return seller if found", async () => {
            (prisma.seller.findUnique as jest.Mock).mockResolvedValue(
                mockSeller
            );

            const result = await sellerService.getSellerById(mockSeller.id);

            expect(result).toEqual(mockSeller);
        });

        it("should throw error if seller not found", async () => {
            (prisma.seller.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                sellerService.getSellerById(mockSeller.id)
            ).rejects.toThrow("Seller not found");
        });
    });

    describe("getSellers", () => {
        const mockSellers = [mockSeller];
        const mockPagination = { page: 1, limit: 10 };

        it("should return paginated sellers", async () => {
            (prisma.seller.findMany as jest.Mock).mockResolvedValue(
                mockSellers
            );
            (prisma.seller.count as jest.Mock).mockResolvedValue(1);

            const result = await sellerService.getAllSellers({
                skip: 0,
                take: 10,
            });

            expect(result).toEqual(mockSellers);
        });
    });

    describe("updateSeller", () => {
        const mockUpdateData = {
            businessName: "Updated Business",
            description: "Updated Description",
        };

        it("should update seller successfully", async () => {
            (prisma.seller.findUnique as jest.Mock).mockResolvedValue(
                mockSeller
            );
            (prisma.seller.update as jest.Mock).mockResolvedValue({
                ...mockSeller,
                ...mockUpdateData,
            });

            const result = await sellerService.updateSellerProfile(
                mockSeller.id,
                mockUpdateData
            );

            expect(result).toEqual({
                ...mockSeller,
                ...mockUpdateData,
            });
        });

        it("should throw error if seller not found", async () => {
            (prisma.seller.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                sellerService.updateSellerProfile(mockSeller.id, mockUpdateData)
            ).rejects.toThrow("Seller not found");
        });
    });

    describe("deleteSeller", () => {
        it("should delete seller successfully", async () => {
            (prisma.seller.findUnique as jest.Mock).mockResolvedValue(
                mockSeller
            );
            (prisma.seller.delete as jest.Mock).mockResolvedValue(mockSeller);

            await sellerService.deleteSellerProfile(mockSeller.id);

            expect(prisma.seller.delete).toHaveBeenCalledWith({
                where: { id: mockSeller.id },
            });
        });

        it("should throw error if seller not found", async () => {
            (prisma.seller.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                sellerService.deleteSellerProfile(mockSeller.id)
            ).rejects.toThrow("Seller not found");
        });
    });
});
