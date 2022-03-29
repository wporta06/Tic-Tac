require('dotenv').config();
const cors = require('cors');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin:"*"
    },
});

io.on('connection', (socket) => {
    console.log('a user connected');

    if (io.engine.clientsCount <= 2) socket.join('main');
    else socket.join('waitingRoom');

    io.to('main').emit('activeUserCount', io.engine.clientsCount);

    socket.on('disconnect', () => {
        io.to('main').emit('activeUserCount', io.engine.clientsCount);
        console.log('user disconnected');
    });

    socket.on('currentMove', (msg) => {
        io.to(['main', 'waitingRoom']).emit('updateMoves', msg);
    });

    socket.on('restart', () => {
        io.to(['main', 'waitingRoom']).emit('restart');
    });
});

server.listen(process.env.PORT, () => {
    console.log(`started in ${process.env.PORT}`);
});
