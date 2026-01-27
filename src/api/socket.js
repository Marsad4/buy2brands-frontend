import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

// Initialize socket connection
export const initializeSocket = (userId) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected');

            // Authenticate user
            if (userId) {
                socket.emit('authenticate', userId);
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    return socket;
};

// Get socket instance
export const getSocket = () => {
    return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Join admin room
export const joinAdminRoom = () => {
    if (socket) {
        socket.emit('joinAdminRoom');
    }
};

// Listen for order status updates
export const onOrderStatusUpdate = (callback) => {
    if (socket) {
        socket.on('orderStatusChanged', callback);
    }
};

// Listen for stock updates
export const onStockUpdate = (callback) => {
    if (socket) {
        socket.on('productStockUpdated', callback);
    }
};

// Listen for new orders (admin)
export const onNewOrder = (callback) => {
    if (socket) {
        socket.on('newOrderReceived', callback);
    }
};

// Emit new order notification
export const emitNewOrder = (orderData) => {
    if (socket) {
        socket.emit('newOrder', orderData);
    }
};

// Emit order status update (admin)
export const emitOrderStatusUpdate = (data) => {
    if (socket) {
        socket.emit('orderStatusUpdate', data);
    }
};

// Emit stock update (admin)
export const emitStockUpdate = (data) => {
    if (socket) {
        socket.emit('stockUpdate', data);
    }
};

export default {
    initializeSocket,
    getSocket,
    disconnectSocket,
    joinAdminRoom,
    onOrderStatusUpdate,
    onStockUpdate,
    onNewOrder,
    emitNewOrder,
    emitOrderStatusUpdate,
    emitStockUpdate
};
