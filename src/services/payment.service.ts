import { prisma } from "@/config/database";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { stripe } from "@/config/stripe";

export class PaymentService {
    async createPayment(
        orderId: string,
        method: PaymentMethod,
        amount: number
    ) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new Error("Order not found");
        }

        switch (method) {
            case PaymentMethod.CARD:
                return this.handleCardPayment(amount);
            case PaymentMethod.CASH_ON_DELIVERY:
                return this.handleCashOnDelivery(orderId);
            default:
                throw new Error("Invalid payment method");
        }
    }

    private async handleCardPayment(amount: number) {
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: "rwf",
        });

        return {
            type: "card",
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
        };
    }

    private async handleCashOnDelivery(orderId: string) {
        // Update order status for COD
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: PaymentStatus.PENDING,
                status: "PROCESSING",
            },
        });

        return {
            type: "cash_on_delivery",
            status: "pending",
        };
    }

    async confirmPayment(paymentId: string, method: PaymentMethod) {
        if (method === PaymentMethod.CARD) {
            return this.confirmCardPayment(paymentId);
        }
        throw new Error("Invalid payment method");
    }

    private async confirmCardPayment(paymentIntentId: string) {
        const paymentIntent =
            await stripe.paymentIntents.retrieve(paymentIntentId);
        return {
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
        };
    }

    async handleWebhook(event: any) {
        const { type, data } = event;

        switch (type) {
            case "payment_intent.succeeded":
                await this.handlePaymentSuccess(data.object);
                break;
            case "payment_intent.payment_failed":
                await this.handlePaymentFailure(data.object);
                break;
            case "charge.refunded":
                await this.handleRefund(data.object);
                break;
        }
    }

    private async handlePaymentSuccess(paymentIntent: any) {
        const order = await prisma.order.findFirst({
            where: { paymentIntentId: paymentIntent.id },
        });

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: PaymentStatus.COMPLETED,
                    status: "PROCESSING",
                },
            });
        }
    }

    private async handlePaymentFailure(paymentIntent: any) {
        const order = await prisma.order.findFirst({
            where: { paymentIntentId: paymentIntent.id },
        });

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: PaymentStatus.FAILED,
                },
            });
        }
    }

    private async handleRefund(charge: any) {
        const order = await prisma.order.findFirst({
            where: { paymentIntentId: charge.payment_intent },
        });

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: PaymentStatus.REFUNDED,
                },
            });
        }
    }
}
