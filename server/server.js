// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const messages = { global: [] }; // messages per room, default 'global'
const typingUsers = {};

// Helper: join room
function joinRoom(socket, room) {
  socket.join(room);
  if (!messages[room]) messages[room] = [];
}

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    joinRoom(socket, 'global');
    console.log(`${username} joined the chat`);
  });

  // Handle joining a room
  socket.on('join_room', (room) => {
    joinRoom(socket, room);
    socket.emit('room_joined', room);
    // Optionally send room message history
    socket.emit('room_messages', { room, messages: messages[room] || [] });
  });

  // Handle leaving a room
  socket.on('leave_room', (room) => {
    socket.leave(room);
    socket.emit('room_left', room);
  });

  // Handle chat messages (now with room and file support)
  socket.on('send_message', (data) => {
    const { message, room = 'global', file } = data;
    const msgObj = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      room,
      ...(file ? { file } : {}),
    };
    if (!messages[room]) messages[room] = [];
    messages[room].push(msgObj);
    if (messages[room].length > 100) messages[room].shift();
    io.to(room).emit('receive_message', msgObj);
  });

  // Handle typing indicator (per room or private chat)
  socket.on('typing', ({ isTyping, room = 'global' }) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      if (!typingUsers[room]) typingUsers[room] = {};
      if (isTyping) {
        typingUsers[room][socket.id] = username;
      } else {
        delete typingUsers[room][socket.id];
      }
      io.to(room).emit('typing_users', Object.values(typingUsers[room]));
    }
  });

  // When joining a private chat, join the private room
  socket.on('join_private_room', ({ user1, user2 }) => {
    const room = `private_${[user1, user2].sort().join('_')}`;
    joinRoom(socket, room);
    socket.emit('room_joined', room);
  });

  // Handle private messages (with file support)
  socket.on('private_message', ({ to, message, file }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
      ...(file ? { file } : {}),
    };
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle read receipts
  socket.on('message_read', ({ messageId }) => {
    // Find the message in all rooms
    let found = false;
    Object.keys(messages).forEach(room => {
      messages[room] = messages[room].map(msg => {
        if (msg.id === messageId) {
          found = true;
          msg.readBy = msg.readBy || [];
          if (!msg.readBy.includes(users[socket.id]?.username)) {
            msg.readBy.push(users[socket.id]?.username);
          }
        }
        return msg;
      });
    });
    if (found) {
      io.emit('message_read', { messageId, reader: users[socket.id]?.username });
    }
  });

  // Handle message reactions
  socket.on('message_reaction', ({ messageId, reaction }) => {
    let found = false;
    Object.keys(messages).forEach(room => {
      messages[room] = messages[room].map(msg => {
        if (msg.id === messageId) {
          found = true;
          msg.reactions = msg.reactions || {};
          msg.reactions[reaction] = msg.reactions[reaction] || [];
          const username = users[socket.id]?.username;
          if (username && !msg.reactions[reaction].includes(username)) {
            msg.reactions[reaction].push(username);
          }
        }
        return msg;
      });
    });
    if (found) {
      io.emit('message_reaction', { messageId, reaction, user: users[socket.id]?.username });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    delete users[socket.id];
    Object.keys(typingUsers).forEach(room => {
      if (typingUsers[room][socket.id]) delete typingUsers[room][socket.id];
    });
    io.emit('user_list', Object.values(users));
    // Optionally emit updated typing users per room
    Object.keys(typingUsers).forEach(room => {
      io.to(room).emit('typing_users', Object.values(typingUsers[room]));
    });
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  // Optionally support room param
  const room = req.query.room || 'global';
  res.json(messages[room] || []);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 