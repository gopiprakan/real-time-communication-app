const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push({ socketId: socket.id, userId });

        const otherUsers = rooms[roomId].filter(u => u.socketId !== socket.id);
        socket.emit('all-users', otherUsers);

        socket.to(roomId).emit('user-joined', { socketId: socket.id, userId });
    });

    socket.on('sending-signal', (payload) => {
        io.to(payload.userToSignal).emit('user-joined-signal', {
            signal: payload.signal,
            callerId: payload.callerId
        });
    });

    socket.on('returning-signal', (payload) => {
        io.to(payload.callerId).emit('receiving-returned-signal', {
            signal: payload.signal,
            id: socket.id
        });
    });

    socket.on('send-message', (data) => {
        io.to(data.roomId).emit('receive-message', data);
    });

    socket.on('draw', (data) => {
        socket.to(data.roomId).emit('drawing', data);
    });

    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);
            socket.to(roomId).emit('user-left', socket.id);
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Socket server running on port ${PORT}`);
});
