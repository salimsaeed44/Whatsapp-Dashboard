/**
 * Socket Service
 * Centralizes Socket.io initialization and realtime events
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let ioInstance = null;
const onlineUsers = new Map();

/**
 * Initialize socket server
 * @param {http.Server} server
 * @param {Object} options
 * @param {string[]} [options.allowedOrigins]
 * @returns {Server}
 */
const initSocket = (server, options = {}) => {
  if (ioInstance) {
    return ioInstance;
  }

  const allowedOrigins = Array.isArray(options.allowedOrigins) ? options.allowedOrigins : [];
  const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : '*';

  ioInstance = new Server(server, {
    cors: {
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type']
    },
    transports: ['websocket', 'polling']
  });

  ioInstance.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      extractBearerToken(socket.handshake.headers?.authorization);

    if (!token) {
      return next();
    }

    const decoded = decodeToken(token);
    if (decoded) {
      socket.user = {
        id: decoded.id || decoded.userId || decoded.sub || null,
        email: decoded.email || decoded.username || null,
        role: decoded.role || decoded.userRole || null,
        name: decoded.name || decoded.full_name || decoded.username || decoded.email || null
      };
    }

    return next();
  });

  ioInstance.on('connection', (socket) => {
    const userId = socket.user?.id || socket.id;
    addOnlineUser(userId, socket);

    socket.emit('socket:connected', {
      socketId: socket.id,
      user: socket.user || null
    });

    broadcastPresence();

    socket.on('conversation:join', ({ conversationId, phoneNumber } = {}) => {
      joinConversationRooms(socket, conversationId, phoneNumber);
    });

    socket.on('conversation:leave', ({ conversationId, phoneNumber } = {}) => {
      leaveConversationRooms(socket, conversationId, phoneNumber);
    });

    socket.on('disconnect', () => {
      removeOnlineUser(userId, socket.id);
      broadcastPresence();
    });
  });

  console.log('⚡ Socket.io initialized');
  return ioInstance;
};

const getIO = () => ioInstance;

const decodeToken = (token) => {
  const jwtSecret =
    process.env.JWT_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET_KEY ||
    process.env.JWT_REFRESH_SECRET;

  try {
    if (jwtSecret) {
      return jwt.verify(token, jwtSecret);
    }
    return jwt.decode(token);
  } catch (error) {
    console.warn('Socket auth token verification failed:', error.message);
    return null;
  }
};

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;
  if (authorizationHeader.startsWith('Bearer ')) {
    return authorizationHeader.replace('Bearer ', '').trim();
  }
  return authorizationHeader.trim();
};

const addOnlineUser = (userId, socket) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, {
      sockets: new Set(),
      user: socket.user || null
    });
  }

  const record = onlineUsers.get(userId);
  record.sockets.add(socket.id);
  record.user = socket.user || record.user;
};

const removeOnlineUser = (userId, socketId) => {
  const record = onlineUsers.get(userId);
  if (!record) return;

  record.sockets.delete(socketId);
  if (record.sockets.size === 0) {
    onlineUsers.delete(userId);
  }
};

const joinConversationRooms = (socket, conversationId, phoneNumber) => {
  if (conversationId) {
    socket.join(`conversation:${conversationId}`);
  }
  if (phoneNumber) {
    socket.join(`phone:${phoneNumber}`);
  }
};

const leaveConversationRooms = (socket, conversationId, phoneNumber) => {
  if (conversationId) {
    socket.leave(`conversation:${conversationId}`);
  }
  if (phoneNumber) {
    socket.leave(`phone:${phoneNumber}`);
  }
};

const broadcastPresence = () => {
  if (!ioInstance) return;

  const payload = {
    timestamp: new Date().toISOString(),
    users: Array.from(onlineUsers.entries()).map(([id, info]) => ({
      id,
      role: info.user?.role || null,
      name: info.user?.name || info.user?.email || null,
      sockets: info.sockets.size
    }))
  };

  ioInstance.emit('presence:update', payload);
};

const emitMessageCreated = (message, conversation = null) => {
  if (!ioInstance || !message) return;
  const payload = {
    message,
    conversation: sanitizeConversation(conversation),
    reason: 'message:new',
    timestamp: new Date().toISOString()
  };

  emitToConversationRooms(message, 'message:new', payload);

  if (conversation) {
    emitConversationUpdated(conversation, {
      last_message: message.content,
      last_message_type: message.message_type,
      last_message_direction: message.direction,
      last_message_status: message.status
    });
  }
};

const emitMessageStatusUpdated = (message) => {
  if (!ioInstance || !message) return;

  const payload = {
    message,
    reason: 'message:status',
    timestamp: new Date().toISOString()
  };

  emitToConversationRooms(message, 'message:status', payload);
};

const emitConversationUpdated = (conversation, overrides = {}) => {
  if (!ioInstance || !conversation) return;
  const payload = {
    conversation: {
      ...sanitizeConversation(conversation),
      ...overrides
    },
    timestamp: new Date().toISOString()
  };

  ioInstance.emit('conversations:update', payload);
};

const emitToConversationRooms = (message, event, payload) => {
  const rooms = [];
  if (message.conversation_id) {
    rooms.push(`conversation:${message.conversation_id}`);
  }
  if (message.phone_number) {
    rooms.push(`phone:${message.phone_number}`);
  }

  rooms.forEach((room) => {
    ioInstance.to(room).emit(event, payload);
  });
};

const sanitizeConversation = (conversation) => {
  if (!conversation) return null;
  return {
    id: conversation.id,
    phone_number: conversation.phone_number,
    contact_name: conversation.contact_name || conversation.metadata?.contact_name,
    status: conversation.status,
    last_message_at: conversation.last_message_at,
    last_message_id: conversation.last_message_id,
    unread_count: conversation.unread_count,
    assigned_to: conversation.assigned_to,
    assigned_to_name: conversation.assigned_to_name,
    metadata: conversation.metadata || {},
    updated_at: conversation.updated_at
  };
};

module.exports = {
  initSocket,
  getIO,
  emitMessageCreated,
  emitMessageStatusUpdated,
  emitConversationUpdated,
  broadcastPresence
};

