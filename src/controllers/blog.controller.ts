import { Request, Response } from "express";
import { BlogService } from "@/services/blog.service";

export class BlogController {
    private blogService: BlogService;

    constructor() {
        this.blogService = new BlogService();
    }

    // Create blog post
    async createBlogPost(req: Request, res: Response) {
        try {
            const blog = await this.blogService.createBlogPost(req.body);
            res.status(201).json(blog);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Update blog post
    async updateBlogPost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const blog = await this.blogService.updateBlogPost(id, req.body);
            res.json(blog);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Delete blog post
    async deleteBlogPost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.blogService.deleteBlogPost(id);
            res.json({ message: "Blog post deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get single blog post
    async getBlogPost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const blog = await this.blogService.getBlogPost(id);
            if (!blog) {
                return res.status(404).json({ message: "Blog post not found" });
            }
            res.json(blog);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get all blog posts (paginated)
    async getBlogPosts(req: Request, res: Response) {
        try {
            const { page, limit, publishedOnly, search } = req.query;
            const blogs = await this.blogService.getBlogPosts({
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                publishedOnly: publishedOnly === "true",
                search: search as string,
            });
            res.json(blogs);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Publish blog post
    async publishBlogPost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const blog = await this.blogService.publishBlogPost(id);
            res.json(blog);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Unpublish blog post
    async unpublishBlogPost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const blog = await this.blogService.unpublishBlogPost(id);
            res.json(blog);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    // Get blog analytics
    async getBlogAnalytics(req: Request, res: Response) {
        try {
            const analytics = await this.blogService.getBlogAnalytics();
            res.json(analytics);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
