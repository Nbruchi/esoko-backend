import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2023-10-16",
    typescript: true,
});

// Define the configuration for the Stripe API
const STRIPE_CONFIG = {
    // Currency for all transactions
    currency: "rwf" as const,
    // Minimum amount for a transactions
    minimumAmount: 1000,
    // Maximum amount for a transactions
    maximumAmount: 100000000,
};

// Export the Stripe instance andconfiguration for use
export { stripe, STRIPE_CONFIG };
