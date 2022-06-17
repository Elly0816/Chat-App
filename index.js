const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const mongoose = require('mongoose');
const http = require('http');

const server = http.createServer(app);
const { Server } = require('socket.io');


/*Creates the websocket */
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});

mongoose.connect('mongodb://localhost:27017/chatDB');

const port = 5000;

/*Message Schema*/

const messageSchema = new mongoose.Schema({
    text: String,
    time: { type: Date, default: Date.now }
});

/*Schema for chats*/
const chatSchema = new mongoose.Schema({
    with: String,
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
});

/*User Schema */
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

/*Create the models*/
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Chat = mongoose.model('Chat', chatSchema);


io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected to the server`);

    socket.on("disconnect", () => {
        console.log(`user ${socket.id} disconnected from the server`);
    });

    socket.on('send', (arg) => {
        console.log(arg);
        socket.emit('send', arg);
    });
});

server.listen(port, () => {
    console.log(`Server up and running at ${port}`);
});