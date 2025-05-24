import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate request body against schema
            const validatedData = await schema.parseAsync(req.body);
            // Replace request body with validated data
            req.body = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: error.errors,
                });
            }
            next(error);
        }
    };
};
