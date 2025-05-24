import { PrismaClient } from "@prisma/client";

// Create a singleton instance of PrismaClient
// This prevents multiple instances during hot reloading in development
const prismaClientSingleton = () => {
    return new PrismaClient({
        // Log all queries in development mode
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });
};

// Define the type for our global prisma instance
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create a global variable to store our prisma instance
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

// Export a single instance of PrismaClient
// If it exists in the global scope, use it; otherwise create a new instance
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, store the instance in the global scope
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

// Export a function to disconnect from the database
// Useful for cleanup in tests or when shutting down the server
export const disconnect = async () => {
    await prisma.$disconnect();
};
