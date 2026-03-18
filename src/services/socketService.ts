import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class QueueSocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    // Connect to queue namespace
    connect() {
        if (this.socket?.connected) return;

        this.socket = io(`${SOCKET_URL}/queue`, {
            transports: ['websocket', 'polling'],
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('Queue socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Queue socket disconnected');
        });

        this.socket.on('queue-event', (data: any) => {
            this.emit('queue-event', data);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Queue socket connection error:', error);
        });
    }

    // Disconnect
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Join specific room
    joinReception() {
        this.socket?.emit('join-reception');
    }

    joinNurseStation() {
        this.socket?.emit('join-nurse-station');
    }

    joinDoctor(doctorId: string) {
        this.socket?.emit('join-doctor', doctorId);
    }

    joinDisplay() {
        this.socket?.emit('join-display');
    }

    // Subscribe to events
    on(event: string, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    // Unsubscribe
    off(event: string, callback: (data: any) => void) {
        this.listeners.get(event)?.delete(callback);
    }

    // Emit to listeners
    private emit(event: string, data: any) {
        this.listeners.get(event)?.forEach(callback => callback(data));
    }

    // Check connection status
    isConnected() {
        return this.socket?.connected ?? false;
    }
}

// Singleton instance
export const queueSocket = new QueueSocketService();

export default queueSocket;
