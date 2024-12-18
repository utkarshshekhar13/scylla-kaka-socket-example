import { Server } from 'socket.io';

let io; // Declare io in a broader scope

/**
 * Initialize Socket.IO with the provided server instance.
 * @param {Object} server - The HTTP server instance.
 */
const initializeSocket = (server) => {
    io = new Server(server);

    io.on('connection', (socket) => {
        console.log("A client connected:", socket.id);

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('A client disconnected:', socket.id);
        });
    });

    return io;
};

/**
 * Get the existing Socket.IO instance.
 * This will throw an error if `initializeSocket` is not called first.
 */
const getSocketIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized! Call `initializeSocket` first.");
    }
    return io;
};

export { initializeSocket, getSocketIO };