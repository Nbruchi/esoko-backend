// src/config/socket.ts
import { Notification, Order, Product } from "@prisma/client";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyAccessToken } from "./jwt";

interface ServerToClientEvents {
    notification: (notification: Notification) => void;
    orderUpdate: (order: Order) => void;
    stockAlert: (product: Product) => void;
}

interface ClientToServerEvents {
    join: (userId: string) => void;
    leave: (userId: string) => void;
}

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
    if (io) {
        return io;
    }

    io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
        },
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication error"));
            }
            const decoded = verifyAccessToken(token);
            socket.data.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId;

        // Join user's room
        socket.join(userId);

        socket.on("join", (room) => {
            socket.join(room);
        });

        socket.on("leave", (room) => {
            socket.leave(room);
        });

        socket.on("disconnect", () => {
            socket.leave(userId);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};
