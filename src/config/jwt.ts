import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

// Define the payload structure for the JWT token
interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
}

// Define the configuration for the JWT token
const JWT_CONFIG = {
    // Access token expres in 15 minutes
    accessTokenExpiry: "15m" as const,
    // Refresh token expires in 7 days
    refreshTokenExpiry: "7d" as const,
    // Secret key for the JWT token
    secret: process.env.JWT_SECRET as string,
};

// Generate an access token
export const generateAccessToken = (payload: TokenPayload): string => {
    const options: SignOptions = { expiresIn: JWT_CONFIG.accessTokenExpiry };
    return jwt.sign(payload, JWT_CONFIG.secret, options);
};

// Generate a refresh token
export const generateRefreshToken = (payload: TokenPayload): string => {
    const options: SignOptions = { expiresIn: JWT_CONFIG.refreshTokenExpiry };
    return jwt.sign(payload, JWT_CONFIG.secret, options);
};

// Generate both access and refresh tokens
export const generateTokens = (payload: TokenPayload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

// Verify an access token
export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_CONFIG.secret) as TokenPayload;
};

// Export the JWT configuration for use
export const jwtConfig = JWT_CONFIG;
