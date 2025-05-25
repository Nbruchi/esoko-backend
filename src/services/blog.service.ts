import { prisma } from "@/config/database";
import { paginate, PaginationParams } from "@/utils/pagination";
import { BlogPost } from "@prisma/client";

export class BlogService {
    //Create blog post
    async createBlogPost(data: {
        title: string;
        content: string;
        author: string;
        image?: string;
    }): Promise<BlogPost> {
        return prisma.blogPost.create({
            data: {
                ...data,
                isPublished: false,
            },
        });
    }

    // Update blog post
    async updateBlogPost(
        id: string,
        data: {
            title?: string;
            content?: string;
            author?: string;
            image?: string;
        }
    ): Promise<BlogPost> {
        const blog = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (!blog) {
            throw new Error("Blog not found");
        }

        return await prisma.blogPost.update({
            where: { id },
            data,
        });
    }

    // Delete blog post
    async deleteBlogPost(id: string) {
        return prisma.blogPost.delete({
            where: { id },
        });
    }

    // Get blog post
    async getBlogPost(id: string) {
        return prisma.blogPost.findUnique({
            where: { id },
        });
    }

    //Get paginated blogs
    async getBlogPosts(
        params: PaginationParams & {
            publishedOnly?: boolean;
            search?: string;
        }
    ) {
        const { publishedOnly = true, search, ...paginationParams } = params;

        const where = {
            isPublished: publishedOnly,
            ...(search && {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: "insensitive" as const,
                        },
                    },
                    {
                        content: {
                            contains: search,
                            mode: "insensitive" as const,
                        },
                    },
                ],
            }),
        };

        return paginate(
            (skip, take) =>
                prisma.blogPost.findMany({
                    where,
                    skip,
                    take,
                    orderBy: { createdAt: "desc" },
                }),
            () => prisma.blogPost.count({ where }),
            paginationParams
        );
    }

    // Publish blog post
    async publishBlogPost(id: string) {
        return prisma.blogPost.update({
            where: { id },
            data: { isPublished: true },
        });
    }

    // Unpublish blog post
    async unpublishBlogPost(id: string) {
        return prisma.blogPost.update({
            where: { id },
            data: { isPublished: false },
        });
    }

    // Get blog analytics
    async getBlogAnalytics() {
        const [totalPosts, publishedPosts, unpublishedPosts] =
            await Promise.all([
                prisma.blogPost.count(),
                prisma.blogPost.count({ where: { isPublished: true } }),
                prisma.blogPost.count({ where: { isPublished: false } }),
            ]);

        return {
            totalPosts,
            publishedPosts,
            unpublishedPosts,
        };
    }
}
