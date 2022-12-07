const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
// const { io } = require('./app.js');
// const http = require('http');
// const { Server } = require('socket.io');
const { User, Message, Chat, passport } = require('./database');
const { otherSocketSend, socketSend, messagesHaveBeenRead } = require('./functions');
// const { Server } = require('socket.io');
require('dotenv').config();


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('trust proxy', 1)
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'client/build')));


const server = http.createServer(app);

/*Creates the websocket */
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT,
        methods: ["GET", "POST"]
    }
});




/*

            WEB SOCKET


*/

io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected to the server`);

    //Listen to when the event to add the socket id to the user's socket field is fired
    socket.on('add', (arg) => {
        const currentUser = arg.userId;
        User.findByIdAndUpdate(currentUser, { $set: { socketId: socket.id } }, { new: true },
            (err, user) => {
                if (err) {
                    console.log(err);
                } else if (!user) {
                    console.log("There was no user found");
                } else {
                    // console.log("The socket id was added to the user");
                    // console.log(user);
                }
            });
    });

    socket.on("disconnect", () => {
        console.log(`user ${socket.id} disconnected from the server`);

    });

    //Socket on delete
    socket.on('delete', (arg) => {
        const otherUser = arg.otherUser;
        const messageId = arg.id;
        const chatId = arg.chatId;
        Message.findByIdAndUpdate(messageId, { $set: { text: '***This message was deleted***' } }, { new: true }, (err, message) => {
            if (err) {
                console.log(err);
            } else if (!message) {
                console.log("The message to delete was not found");
            } else {
                Chat.findById(chatId, (err, chat) => {
                    if (err) {
                        console.log(err);
                    } else if (!chat) {
                        console.log("The chat that the message was deleted from was not found");
                    } else {
                        User.findById(otherUser, (err, user) => {
                            if (err) {
                                console.log("There was an error in the database");
                            } else if (!user) {
                                console.log("The other user was not found after deleting the message");
                            } else {
                                const messages = chat.messages.map(message => message.toString());
                                Message.find({ '_id': { $in: messages } }, (err, msgs) => {
                                    if (err) {
                                        console.log(err);
                                    } else if (!msgs) {
                                        console.log("Could not find the messages from the chat after deleting the message");
                                    } else {
                                        socket.emit('deleted', msgs);
                                        io.to(user.socketId).emit('deleted', msgs);
                                    }
                                })
                            }
                        })
                    }
                });
            }
        })
    });

    /*This sends a message to the user currently being chatted with */
    socket.on('send', (arg) => {
        const message = arg.message;
        const chatId = arg.chatId;
        const senderId = arg.senderId;
        const otherUserId = arg.otherUserId;
        Message.create({ text: message, sender: senderId, chatId: chatId }, (err, message) => {
            if (err) {
                console.log(err);
            } else {
                Chat.findByIdAndUpdate(chatId, { $push: { messages: message._id } }, { new: true }, (err, chat) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const messageIds = chat.messages.map(message => message.toString());
                        Message.find({ '_id': { $in: messageIds } }, (err, msgs) => {
                            if (err) {
                                console.log(err);
                            } else {
                                //Find the current user and set the socket id to the current on if it is not already that
                                User.findById(otherUserId, (err, user) => {
                                    if (err) {
                                        console.log(err);
                                    } else if (!user) {
                                        console.log("The other user could not be found while retreiving the socket id");
                                    } else {
                                        const socketId = user.socketId;
                                        io.to(socketId).emit('receive', msgs);
                                        socket.emit('receive', msgs);
                                        io.to(socketId).emit('play');
                                        otherSocketSend(user._id.toString(), io);
                                    }
                                })
                            }
                        })
                    }
                })
            }
        });
    });


    /*This searches the database for a matching username */
    socket.on('search', (arg) => {
        console.log(arg, 'is what is in the search box');
        const regex = new RegExp(arg, 'i');
        User.find({ fullName: { $regex: regex } }, (err, users) => {
            if (err) {
                console.log(err);
            } else {
                if (!users) {
                    socket.emit('search', 'No users found');
                } else {
                    socket.emit('search', users);
                    console.log(users);
                }
            }
        });
    });


    //This handles the marking of viewed messages as seen
    socket.on('seen', (arg) => {

        const userId = arg.userId;
        const chatId = arg.chatId;
        const otherUserId = arg.otherUserId;
        // console.log(`The messages in ${chatId} have been seen by the user with id: ${userId}`);
        // console.log(userId, chatId);
        console.log(`This should be seen by ${otherUserId}`);
        /*Write a function that turns the seen property
         of all the messages belonging to the other user
          in the chat to true?
        */

        /*
          emit an object of {chats, otherUsers, unreads} from the socket 
         */
        Chat.findById(chatId, (err, chat) => {
            if (err) {
                console.log(err);
            } else if (!chat) {
                console.log("There was no chat found");
            } else {
                const messages = chat.messages;
                // console.log(messages);
                messagesHaveBeenRead(messages).then(messageItems => {
                    User.findById(userId, 'chats', (err, user) => {
                        if (err) {
                            console.log(err);
                        } else if (!user) {
                            console.log("The user does not exist");
                        } else {
                            const chats = user.chats.map(chat => chat.toString());
                            Chat.find({ '_id': { $in: chats } }, (err, chats) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    const otherUsers = chats.map(chat => chat.between.filter(id => id.toString() !== userId)).map(id => id.toString());
                                    // console.log(otherUsers);
                                    User.find({ '_id': { $in: otherUsers } }, (err, users) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            const chatIds = chats.map(chat => chat._id);
                                            //map the unread function to an array of chat ids 
                                            // socketSend(socket, users.socketId, chats, users.fullName, chatIds, userId, otherUserId);
                                            socketSend(socket, chats, users, chatIds, userId);
                                            // otherSocketSend(otherUserId);
                                        }
                                    });

                                }
                            })
                        }
                    });
                    // socketSend(socket, chats, users, chatIds, userId);
                })

            }
        });

    });
});




module.exports = {
    server,
    app
}