import { z } from "zod";

//User validation schemas
export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phoneNumber: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

// Product validation schemas
export const productSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be positive"),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    categoryId: z.string().uuid("Invalid category ID"),
    images: z.array(z.string().url("Invalid image URL")),
});

// Order validation schema
export const orderSchema = z.object({
    addressId: z.string().uuid("Invalid address ID"),
    items: z.array(
        z.object({
            productId: z.string().uuid("Invalid product ID"),
            quantity: z.number().int().positive("Quantity must be positive"),
        })
    ),
    paymentMethod: z.enum(["STRIPE", "MOBILE_MONEY"], {
        errorMap: () => ({ message: "Invalid payment method" }),
    }),
});

// Address validation schema
export const addressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    isDefault: z.boolean().optional(),
});

// Review validation schema
export const reviewSchema = z.object({
    rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
    comment: z
        .string()
        .min(10, "Comment must be at least 10 characters")
        .optional(),
});
