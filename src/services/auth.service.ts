import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateTokens } from "@/config/jwt";
import { prisma } from "@/config/database";

export class AuthService {
    // Register user
    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }): Promise<{
        user: Omit<User, "password">;
        tokens: { accessToken: string; refreshToken: string };
    }> {
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new Error("User already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
            },
        });

        //Generate token
        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, tokens };
    }

    // Login user
    async login(
        email: string,
        password: string
    ): Promise<{
        user: Omit<User, "password">;
        tokens: { accessToken: string; refreshToken: string };
    }> {
        //Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        //Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid credentials");
        }

        // Generate tokens
        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, tokens };
    }
}
