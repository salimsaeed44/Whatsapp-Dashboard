import { io } from 'socket.io-client';

const resolveSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }

  return 'http://localhost:3000';
};

const SOCKET_URL = resolveSocketUrl();

const getAccessToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('accessToken');
};

class SocketService {
  constructor() {
    this.socket = null;
    this.url = SOCKET_URL;
  }

  connect(options = {}) {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        autoConnect: true,
        auth: this.buildAuthPayload(),
        ...options
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      this.socket.on('disconnect', (reason) => {
        console.info('Socket disconnected:', reason);
      });
    } else if (!this.socket.connected) {
      this.socket.auth = this.buildAuthPayload();
      this.socket.connect();
    }

    return this.socket;
  }

  buildAuthPayload() {
    const token = getAccessToken();
    return token ? { token } : undefined;
  }

  refreshAuth() {
    if (this.socket) {
      this.socket.auth = this.buildAuthPayload();
      if (!this.socket.connected) {
        this.socket.connect();
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    const socket = this.connect();
    if (!socket) {
      return () => {};
    }

    socket.on(event, callback);
    return () => socket.off(event, callback);
  }

  emit(event, payload) {
    const socket = this.connect();
    if (socket) {
      socket.emit(event, payload);
    }
  }

  joinConversation(conversationId, phoneNumber) {
    this.emit('conversation:join', { conversationId, phoneNumber });
  }

  leaveConversation(conversationId, phoneNumber) {
    this.emit('conversation:leave', { conversationId, phoneNumber });
  }
}

export const socketService = new SocketService();

