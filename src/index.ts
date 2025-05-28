import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { initializeSocket } from "@/config/socket";

// Load environment variables
config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Import routes
import authRoutes from "@/routes/auth.routes";
import blogRoutes from "@/routes/blog.routes";
import cartRoutes from "@/routes/cart.routes";
import categoryRoutes from "@/routes/category.routes";
import emailRoutes from "@/routes/email.routes";
import fileRoutes from "@/routes/file.routes";
import notificationRoutes from "@/routes/notification.routes";
import orderRoutes from "@/routes/order.routes";
import paymentRoutes from "@/routes/payment.routes";
import productRoutes from "@/routes/product.routes";
import sellerRoutes from "@/routes/seller.routes";
import userRoutes from "@/routes/user.routes";

const app = express();

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Esoko API Documentation",
            version: "1.0.0",
            description: "API documentation for Esoko e-commerce platform",
            contact: {
                name: "API Support",
                email: "support@esoko.com",
            },
        },
        servers: [
            {
                url: process.env.DEV_API_URL || "http://localhost:3000",
                description: "Development server",
            },
            {
                url: process.env.PROD_API_URL || "https://api.esoko.com",
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts"], // Path to the API routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Initialize services
const initializeServices = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log("Database connected successfully");

        // Initialize Socket.IO
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(
                `API Documentation available at http://localhost:${PORT}/api-docs`
            );
        });
        initializeSocket(server);
        console.log("Socket.IO initialized successfully");
    } catch (error) {
        console.error("Error initializing services:", error);
        process.exit(1);
    }
};

// Middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check route
app.get("/health", async (req, res) => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            services: {
                database: "connected",
                socket: "initialized",
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Service health check failed",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error(err.stack);
        res.status(500).json({
            status: "error",
            message: "Something went wrong!",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (error: Error) => {
    console.error("Unhandled Promise Rejection:", error);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught Exception:", error);
    // Close server & exit process
    process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
initializeServices();

export default app;
