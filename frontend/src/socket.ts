import { io, Socket } from 'socket.io-client';

// Should be an environment variable
const SOCKET_URL = 'http://localhost:5000';

let socket: Socket;

export const initSocket = () => {
    socket = io(SOCKET_URL);
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};
