require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');
const { checkProximity, PROXIMITY_RADIUS } = require('./utils/proximity');
const { joinRoom, leaveRoom, leaveAllRooms, getRoomMembers } = require('./utils/roomManager');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const users = {};

const AVATAR_COLORS = [
  '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'
];
let colorIndex = 0;

function getNextColor() {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  colorIndex++;
  return color;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', onlineUsers: Object.keys(users).length });
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

io.on('connection', (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  socket.on('user:join', async ({ username }) => {
    const avatarColor = getNextColor();
    const startX = Math.floor(Math.random() * 600) + 100;
    const startY = Math.floor(Math.random() * 400) + 100;

    const userData = {
      id: socket.id,
      username: username || 'Anonymous',
      avatarColor,
      position: { x: startX, y: startY }
    };

    users[socket.id] = userData;

    try {
      await User.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: socket.id, username: userData.username, avatarColor, position: userData.position, isOnline: true },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('MongoDB error:', err.message);
    }

    socket.emit('user:joined', userData);
    socket.emit('users:list', users);
    socket.broadcast.emit('user:new', userData);

    console.log(`[JOIN] ${userData.username} (${socket.id}) at (${startX}, ${startY})`);
  });

  socket.on('user:move', async ({ x, y }) => {
    if (!users[socket.id]) return;

    const clampedX = Math.max(20, Math.min(780, x));
    const clampedY = Math.max(20, Math.min(580, y));

    users[socket.id].position = { x: clampedX, y: clampedY };

    socket.broadcast.emit('user:moved', {
      id: socket.id,
      position: { x: clampedX, y: clampedY }
    });

    User.findOneAndUpdate(
      { socketId: socket.id },
      { position: { x: clampedX, y: clampedY } }
    ).catch(() => {});

    // ── PROXIMITY CHECK (with duplicate prevention) ──────────────────────
    const { toConnect, toDisconnect } = checkProximity(socket.id, users, getRoomMembers);

    toConnect.forEach(({ userId, roomId, distance }) => {
      joinRoom(io, socket.id, roomId);
      joinRoom(io, userId, roomId);

      socket.emit('proximity:connect', {
        userId,
        roomId,
        username: users[userId]?.username,
        avatarColor: users[userId]?.avatarColor,
        distance
      });

      io.to(userId).emit('proximity:connect', {
        userId: socket.id,
        roomId,
        username: users[socket.id]?.username,
        avatarColor: users[socket.id]?.avatarColor,
        distance
      });
    });

    toDisconnect.forEach(({ userId, roomId }) => {
      leaveRoom(io, socket.id, roomId);
      leaveRoom(io, userId, roomId);

      socket.emit('proximity:disconnect', { userId, roomId });
      io.to(userId).emit('proximity:disconnect', { userId: socket.id, roomId });
    });
  });

  socket.on('chat:message', ({ roomId, text }) => {
    if (!users[socket.id] || !text.trim()) return;

    const message = {
      id: Date.now() + Math.random(),
      from: users[socket.id].username,
      fromId: socket.id,
      avatarColor: users[socket.id].avatarColor,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    socket.to(roomId).emit('chat:message', { roomId, message });
    console.log(`[CHAT] ${message.from} → room ${roomId}: "${text}"`);
  });

  socket.on('chat:typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('chat:typing', {
      userId: socket.id,
      username: users[socket.id]?.username,
      isTyping
    });
  });

  socket.on('disconnect', async () => {
    const user = users[socket.id];
    if (!user) return;

    console.log(`[-] ${user.username} disconnected`);

    leaveAllRooms(io, socket.id);
    socket.broadcast.emit('user:left', { id: socket.id });
    delete users[socket.id];

    try {
      await User.findOneAndUpdate({ socketId: socket.id }, { isOnline: false });
    } catch (err) {}
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-cosmos';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.IO ready | Proximity radius: ${PROXIMITY_RADIUS}px`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Starting server WITHOUT database...');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (no DB)`);
    });
  });