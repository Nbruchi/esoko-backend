import { BlogService } from "@/services/blog.service";
import { prisma } from "@/config/database";

// Mock Prisma client
jest.mock("@/config/database", () => ({
    prisma: {
        blogPost: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    },
}));

describe("BlogService", () => {
    let blogService: BlogService;
    const mockBlogPost = {
        id: "blog123",
        title: "Test Blog",
        content: "This is a test blog post",
        author: "John Doe",
        image: "blog.jpg",
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        blogService = new BlogService();
        jest.clearAllMocks();
    });

    describe("createBlogPost", () => {
        const mockBlogData = {
            title: "Test Blog",
            content: "This is a test blog post",
            author: "John Doe",
            image: "blog.jpg",
        };

        it("should create a blog post successfully", async () => {
            (prisma.blogPost.create as jest.Mock).mockResolvedValue(
                mockBlogPost
            );

            const result = await blogService.createBlogPost(mockBlogData);

            expect(result).toEqual(mockBlogPost);
            expect(prisma.blogPost.create).toHaveBeenCalledWith({
                data: {
                    ...mockBlogData,
                    isPublished: false,
                },
            });
        });
    });

    describe("updateBlogPost", () => {
        const mockUpdateData = {
            title: "Updated Blog",
            content: "Updated content",
        };

        it("should update blog post successfully", async () => {
            (prisma.blogPost.findUnique as jest.Mock).mockResolvedValue(
                mockBlogPost
            );
            (prisma.blogPost.update as jest.Mock).mockResolvedValue({
                ...mockBlogPost,
                ...mockUpdateData,
            });

            const result = await blogService.updateBlogPost(
                mockBlogPost.id,
                mockUpdateData
            );

            expect(result).toEqual({
                ...mockBlogPost,
                ...mockUpdateData,
            });
            expect(prisma.blogPost.update).toHaveBeenCalledWith({
                where: { id: mockBlogPost.id },
                data: mockUpdateData,
            });
        });

        it("should throw error if blog post not found", async () => {
            (prisma.blogPost.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                blogService.updateBlogPost(mockBlogPost.id, mockUpdateData)
            ).rejects.toThrow("Blog not found");
        });
    });

    describe("getBlogPost", () => {
        it("should return blog post if found", async () => {
            (prisma.blogPost.findUnique as jest.Mock).mockResolvedValue(
                mockBlogPost
            );

            const result = await blogService.getBlogPost(mockBlogPost.id);

            expect(result).toEqual(mockBlogPost);
            expect(prisma.blogPost.findUnique).toHaveBeenCalledWith({
                where: { id: mockBlogPost.id },
            });
        });

        it("should return null if blog post not found", async () => {
            (prisma.blogPost.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await blogService.getBlogPost(mockBlogPost.id);

            expect(result).toBeNull();
        });
    });

    describe("getBlogPosts", () => {
        const mockBlogPosts = [mockBlogPost];
        const mockPaginationParams = {
            page: 1,
            limit: 10,
        };

        it("should return paginated blog posts", async () => {
            (prisma.blogPost.findMany as jest.Mock).mockResolvedValue(
                mockBlogPosts
            );
            (prisma.blogPost.count as jest.Mock).mockResolvedValue(1);

            const result = await blogService.getBlogPosts(mockPaginationParams);

            expect(result).toEqual({
                data: mockBlogPosts,
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });

        it("should filter by published status", async () => {
            (prisma.blogPost.findMany as jest.Mock).mockResolvedValue(
                mockBlogPosts
            );
            (prisma.blogPost.count as jest.Mock).mockResolvedValue(1);

            await blogService.getBlogPosts({
                ...mockPaginationParams,
                publishedOnly: false,
            });

            expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        isPublished: false,
                    }),
                })
            );
        });

        it("should filter by search term", async () => {
            (prisma.blogPost.findMany as jest.Mock).mockResolvedValue(
                mockBlogPosts
            );
            (prisma.blogPost.count as jest.Mock).mockResolvedValue(1);

            await blogService.getBlogPosts({
                ...mockPaginationParams,
                search: "test",
            });

            expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({
                                title: expect.objectContaining({
                                    contains: "test",
                                    mode: "insensitive",
                                }),
                            }),
                        ]),
                    }),
                })
            );
        });
    });
});
