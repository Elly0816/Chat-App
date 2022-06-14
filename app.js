const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const mongoose = require('mongoose');
const http = require('http');

const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});

mongoose.connect('mongodb://localhost:27017/chat');

const port = 5000;

/*Build the messages schema and database*/

const msgSchema = new mongoose.Schema({
    from: String,
    message: String,
    to: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
})



io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected to the server`);

    socket.on("disconnect", () => {
        console.log(`user ${socket.id} disconnected from the server`)
    })
})

server.listen(port, () => {
    console.log(`Server up and running at ${port}`)
})