let io;
const activeUsers = new Map(); // userId -> socketId

exports.initSocket = (serverIo) => {
  io = serverIo;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register active user
    socket.on('registerUser', (userId) => {
      activeUsers.set(userId, socket.id);
      socket.join(userId); // Join personal room for notifications/direct messages
      io.emit('userStatus', { userId, status: 'online' });
      console.log(`User registered: ${userId} with socket: ${socket.id}`);
    });

    // Handle join chat room
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle typing status
    socket.on('typing', ({ roomId, userId, isTyping }) => {
      socket.to(roomId).emit('typingStatus', { userId, isTyping });
    });

    // Handle read receipts
    socket.on('readReceipt', ({ roomId, messageId, readerId }) => {
      socket.to(roomId).emit('messageRead', { messageId, readerId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      let disconnectedUser = null;
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUser = userId;
          activeUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUser) {
        io.emit('userStatus', { userId: disconnectedUser, status: 'offline' });
        console.log(`User unregistered: ${disconnectedUser}`);
      }
    });
  });
};

exports.sendRealtimeMessage = (roomId, message) => {
  if (io) {
    io.to(roomId).emit('messageReceived', message);
  }
};

exports.sendRealtimeNotification = (userId, notification) => {
  if (io) {
    io.to(userId).emit('notificationReceived', notification);
  }
};

exports.isUserOnline = (userId) => {
  return activeUsers.has(userId);
};
