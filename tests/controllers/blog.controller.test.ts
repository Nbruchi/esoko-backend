import { BlogController } from "@/controllers/blog.controller";
import { BlogService } from "@/services/blog.service";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { BlogPost } from "@prisma/client";
import { PaginatedRsponse } from "@/utils/pagination";

jest.mock("@/services/blog.service");

describe("BlogController", () => {
    let blogController: BlogController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockBlogService: jest.Mocked<BlogService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockBlogService = new BlogService() as jest.Mocked<BlogService>;
        (BlogService as jest.Mock).mockImplementation(() => mockBlogService);
        blogController = new BlogController();
    });

    describe("createBlogPost", () => {
        it("should return 201 and created post", async () => {
            const mockPost: BlogPost = {
                id: "post123",
                title: "Test Post",
                content: "Test Content",
                author: "user123",
                image: null,
                isPublished: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockBlogService.createBlogPost.mockResolvedValue(mockPost);
            mockRequest.body = {
                title: "Test Post",
                content: "Test Content",
                author: "user123",
            };

            await blogController.createBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
        });

        it("should return 400 when creation fails", async () => {
            mockBlogService.createBlogPost.mockRejectedValue(
                new Error("Invalid data")
            );
            mockRequest.body = {
                title: "Test Post",
                content: "Test Content",
            };

            await blogController.createBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Invalid data",
            });
        });
    });

    describe("getBlogPosts", () => {
        it("should return list of posts", async () => {
            const mockPosts: PaginatedRsponse<BlogPost> = {
                data: [
                    {
                        id: "post123",
                        title: "Test Post",
                        content: "Test Content",
                        author: "user123",
                        image: null,
                        isPublished: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            };

            mockBlogService.getBlogPosts.mockResolvedValue(mockPosts);
            mockRequest.query = { page: "1", limit: "10" };

            await blogController.getBlogPosts(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith(mockPosts);
        });

        it("should handle search and publishedOnly filters", async () => {
            const mockPosts: PaginatedRsponse<BlogPost> = {
                data: [
                    {
                        id: "post123",
                        title: "Test Post",
                        content: "Test Content",
                        author: "user123",
                        image: null,
                        isPublished: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            };

            mockBlogService.getBlogPosts.mockResolvedValue(mockPosts);
            mockRequest.query = {
                page: "1",
                limit: "10",
                publishedOnly: "true",
                search: "test",
            };

            await blogController.getBlogPosts(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith(mockPosts);
        });
    });

    describe("getBlogPost", () => {
        it("should return post details", async () => {
            const mockPost: BlogPost = {
                id: "post123",
                title: "Test Post",
                content: "Test Content",
                author: "user123",
                image: null,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockBlogService.getBlogPost.mockResolvedValue(mockPost);
            mockRequest.params = { id: "post123" };

            await blogController.getBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
        });

        it("should return 404 when post not found", async () => {
            mockBlogService.getBlogPost.mockResolvedValue(null);
            mockRequest.params = { id: "nonexistent" };

            await blogController.getBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Blog post not found",
            });
        });
    });

    describe("updateBlogPost", () => {
        it("should return updated post", async () => {
            const mockPost: BlogPost = {
                id: "post123",
                title: "Updated Post",
                content: "Updated Content",
                author: "user123",
                image: null,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockBlogService.updateBlogPost.mockResolvedValue(mockPost);
            mockRequest.params = { id: "post123" };
            mockRequest.body = {
                title: "Updated Post",
                content: "Updated Content",
            };

            await blogController.updateBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
        });

        it("should return 400 when update fails", async () => {
            mockBlogService.updateBlogPost.mockRejectedValue(
                new Error("Update failed")
            );
            mockRequest.params = { id: "post123" };
            mockRequest.body = {
                title: "Updated Post",
                content: "Updated Content",
            };

            await blogController.updateBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Update failed",
            });
        });
    });

    describe("deleteBlogPost", () => {
        it("should return success message", async () => {
            const mockPost: BlogPost = {
                id: "post123",
                title: "Test Post",
                content: "Test Content",
                author: "user123",
                image: null,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockBlogService.deleteBlogPost.mockResolvedValue(mockPost);
            mockRequest.params = { id: "post123" };

            await blogController.deleteBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Blog post deleted successfully",
            });
        });

        it("should return 400 when deletion fails", async () => {
            mockBlogService.deleteBlogPost.mockRejectedValue(
                new Error("Deletion failed")
            );
            mockRequest.params = { id: "post123" };

            await blogController.deleteBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Deletion failed",
            });
        });
    });

    describe("publishBlogPost", () => {
        it("should return published post", async () => {
            const mockPost: BlogPost = {
                id: "post123",
                title: "Test Post",
                content: "Test Content",
                author: "user123",
                image: null,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockBlogService.publishBlogPost.mockResolvedValue(mockPost);
            mockRequest.params = { id: "post123" };

            await blogController.publishBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
        });

        it("should return 400 when publishing fails", async () => {
            mockBlogService.publishBlogPost.mockRejectedValue(
                new Error("Publishing failed")
            );
            mockRequest.params = { id: "post123" };

            await blogController.publishBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Publishing failed",
            });
        });
    });

    describe("unpublishBlogPost", () => {
        it("should return unpublished post", async () => {
            const mockPost: BlogPost = {
                id: "post123",
                title: "Test Post",
                content: "Test Content",
                author: "user123",
                image: null,
                isPublished: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockBlogService.unpublishBlogPost.mockResolvedValue(mockPost);
            mockRequest.params = { id: "post123" };

            await blogController.unpublishBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
        });

        it("should return 400 when unpublishing fails", async () => {
            mockBlogService.unpublishBlogPost.mockRejectedValue(
                new Error("Unpublishing failed")
            );
            mockRequest.params = { id: "post123" };

            await blogController.unpublishBlogPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Unpublishing failed",
            });
        });
    });

    describe("getBlogAnalytics", () => {
        it("should return analytics data", async () => {
            const mockAnalytics = {
                totalPosts: 10,
                publishedPosts: 5,
                unpublishedPosts: 5,
            };

            mockBlogService.getBlogAnalytics.mockResolvedValue(mockAnalytics);

            await blogController.getBlogAnalytics(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalledWith(mockAnalytics);
        });

        it("should return 400 when analytics fetch fails", async () => {
            mockBlogService.getBlogAnalytics.mockRejectedValue(
                new Error("Analytics fetch failed")
            );

            await blogController.getBlogAnalytics(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Analytics fetch failed",
            });
        });
    });
});
