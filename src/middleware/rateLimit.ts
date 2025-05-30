import rateLimit from "express-rate-limit";

// Rate limit for login attempts
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        error: "Too many login attempts, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit for refresh token requests
export const refreshTokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 refresh attempts per window
    message: {
        success: false,
        error: "Too many token refresh attempts, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit for password reset requests
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
        success: false,
        error: "Too many password reset attempts, please try again after an hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit for registration
export const registerLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 10, // 10 registrations per 2 minutes
    message: {
        success: false,
        error: "Too many registration attempts, please try again after 2 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
