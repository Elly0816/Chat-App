const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const passportLocalMongoose = require('passport-local-mongoose');
const { Server } = require('socket.io');
const passport = require('passport');
const session = require('express-session');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');



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

const url = process.env.NODE_ENV === 'production' ? process.env.MONGO : "mongodb://localhost:27017/chatDB";



const server = http.createServer(app);

/*Creates the websocket */
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT,
        methods: ["GET", "POST"]
    }
});


mongoose.connect(url);
// mongoose.connect('mongodb://localhost:27017/chatDB');

const port = process.env.PORT || 5000;


app.use(express.static(path.join(__dirname, 'client/build')));

/*Message Schema*/

const messageSchema = new mongoose.Schema({
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    time: { type: Date, default: Date.now },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    seen: false
});

/*Schema for chats*/
const chatSchema = new mongoose.Schema({
    between: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

/*User Schema */
const userSchema = new mongoose.Schema({
    userName: String,
    firstName: String,
    lastName: String,
    fullName: String,
    email: String,
    password: String,
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    socketId: String
});

/*Add passport local mongoose to the user schema */
userSchema.plugin(passportLocalMongoose);

/*Create the models*/
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Chat = mongoose.model('Chat', chatSchema);

/*Authenticate with local strategy */
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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
});


/*

                ROUTES



*/


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build', 'index.html'), (err) => {
        res.status(500).send(err);
    });
});

/*This is the register route */
app.post('/api/register', (req, res) => {
    const data = req.body;
    console.log(data);
    User.findOne({ username: data.email }, (err, user) => {
        if (err) {
            console.log("There was an error with the database 245");
            console.log(err);
        } else if (user) {
            console.log("User already exists");
            res.send({ response: 'login' });
        } else {
            User.register(new User({
                username: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                fullName: `${data.firstName} ${data.lastName}`,
                email: data.email,
            }), password = data.password, (err) => {
                if (err) {
                    console.log(err);
                    console.log("There was an error with registering the user");
                    res.send({ response: 'register' })
                } else {
                    console.log('No error in registering the user');
                    const authenticate = User.authenticate('local');
                    authenticate(data.email, data.password, (err, user) => {
                        if (err) {
                            console.log(err);
                            console.log("There was an error with authenticating the user");
                            res.send({ response: 'register' });
                        } else {
                            console.log("No error in authenticating the user");
                            req.login(user, (err) => {
                                if (err) {
                                    console.log("There was a error with logging in the user after registeration");
                                    console.log(err);
                                } else {
                                    console.log("Logged in after registeration");
                                    console.log('Registering, redirecting to messages page');
                                    //Jwt of the user
                                    token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: '1h' });
                                    console.log(user);
                                    res.send({ token: token, user: user });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});


/*This is the login route */
app.post('/api/login', (req, res) => {
    const data = req.body;
    console.log(data);
    const authenticate = User.authenticate('local');
    authenticate(data.email, data.password, (err, user) => {
        if (err) {
            console.log(err);
            res.send({ response: 'login' });
        } else if (!user) {
            console.log("Incorrect Credentials");
            res.send({ response: 'Incorrect Credentials' });
        } else {
            console.log("Found user");
            req.login(user, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Logged in");
                    token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: '1h' });
                    console.log(user);
                    res.send({ token: token, user: user });
                }
            });
        }
    });
});


// Get current user details
app.get('/api/user/:id', (req, res) => {
    const id = req.params.id;
    User.findById(id, (err, user) => {
        if (err) {
            console.log("There was an error with the database 328");
            console.log(err);
        } else if (!user) {
            console.log("There was no user found in the database");
            res.send({ user: 'None' })
        } else {
            res.send({ user: user });
        }
    })
});


/*Logout route */
app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
    });
    res.send({ response: "logged out" });
});



/*Profile route*/
/*Get returns the user details to the client while Post edits the user info such as name and email */
app.route('/api/profile/:id')
    .get((req, res) => {
        const id = req.params.id;
        User.findById(id, ['_id', 'firstName', 'lastName', 'fullName', 'email', 'connections', 'requests', 'pendingRequests'], (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("This user does not exist");
                res.send({ response: 'User not found!' });
            } else {
                console.log(`This is the user: ${user}`);
                res.send({ response: user });
            }
        });
    })
    // Patch updates the body of the user 
    .patch((req, res) => {
        const id = req.params.id;
        User.findByIdAndUpdate(id, { $set: req.body }, { new: true, projection: ['_id', 'firstName', 'lastName', 'fullName', 'email'] }, (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("There was no user found");
                res.send({ response: 'User not found' });
            } else {
                console.log('The user was updated successfully');
                res.send({ response: user });
            }
        });
    });



/*Handle connection requests */
app.route("/api/request/:id")
    .get((req, res) => {
        const id = req.params.id;
        User.findById(id, ['requests', 'pendingRequests'], (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The user does not exist");
                res.send({ response: "This user does not exist" });
            } else {
                /*This is a list of user id's in the requests field */
                const requests = user.requests.map(item => item.toString());
                const pending = user.pendingRequests.map(item => item.toString());
                console.log(requests);
                User.find({ '_id': { $in: requests } }, ['_id', 'firstName', 'lastName', 'fullName'],
                    (err, users) => {
                        if (err) {
                            console.log(err);
                        } else if (!users) {
                            console.log("There were no users found");
                        } else {
                            User.find({ '_id': { $in: pending } }, ['_id', 'firstName', 'lastName', 'fullName'],
                                (err, pendings) => {
                                    if (err) {
                                        console.log(err);
                                    } else if (!pendings) {
                                        console.log("There were no users found");
                                    } else {
                                        res.send({ users: users, pending: pendings });
                                    }
                                });
                        }
                    });
                /*This returns an array of users that are in the requests field and user ids in the pending requests field */
            }
        });
    })
    .post((req, res) => {
        const id = req.params.id;
        const requestTo = req.body.id;
        //Add current user to other user's requests list
        User.findByIdAndUpdate(requestTo, { $push: { requests: id } }, { new: true },
            (err, user) => {
                if (err) {
                    console.log(err);
                } else if (!user) {
                    console.log("The user you're sending the request to does not exist");
                } else {
                    console.log("The request was sent successfully");
                    /*Add the id the request was sent to to the current users' pending requests */
                    User.findByIdAndUpdate(id, { $push: { pendingRequests: requestTo } }, { new: true },
                        (err, user) => {
                            if (err) {
                                console.log(err);
                            } else if (!user) {
                                console.log("The user to add the pending request to was not found")
                            } else {
                                console.log("The request was added to your pending request");
                                res.send({ user: user });
                            }
                        });

                }
            });

    })
    .patch((req, res) => {
        const id = req.params.id;
        const requestFrom = req.body.id;
        //Remove current user from other user's pending request list
        User.findByIdAndUpdate(requestFrom, { $pull: { pendingRequests: id } }, { new: true },
            (err, user) => {
                if (err) {
                    console.log(err);
                } else if (!user) {
                    console.log("The user the request was sent from was not found");
                } else {
                    console.log("You were removed from their pending requests");
                    //Remove other user from current user's requests list
                    User.findByIdAndUpdate(id, { $pull: { requests: requestFrom } }, { new: true },
                        (err, user) => {
                            if (err) {
                                console.log(err);
                            } else if (!user) {
                                console.log("The user to remove the request from was not found");
                            } else {
                                console.log("You have declined the connection request");
                                res.send({ user: user });
                            }
                        });
                }
            });
    });

/*Route to handle pending requests by deleting them */
app.patch('/api/pending-requests/:id', (req, res) => {
    const id = req.params.id;
    const toDelete = req.body.id;
    //Remove the current user from the other user's requests
    User.findByIdAndUpdate(toDelete, { $pull: { requests: id } }, { new: true },
        (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The user the request was sent to was not found");
            } else {
                console.log("Your request was removed from the user's list of requests");
                //Remove the other user from the current user's pending requests
                User.findByIdAndUpdate(id, { $pull: { pendingRequests: toDelete } }, { new: true },
                    (err, user) => {
                        if (err) {
                            console.log(err);
                        } else if (!user) {
                            console.log("The user was not found");
                        } else {
                            console.log("The user was removed from your list of pending requests");
                            res.send({ user: user });
                        }
                    })
            }
        })
});

app.route("/api/connection/:id")
    .get((req, res) => {
        const id = req.params.id;
        User.findById(id, ['connections'], (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("Your account was not found");
            } else {
                console.log("Your account was found");
                const connections = user.connections.map(connection => connection.toString());
                //Find the users that have id's in the current users' connections
                User.find({ '_id': { $in: connections } }, ['_id', 'firstName', 'lastName', 'fullName'],
                    (err, users) => {
                        if (err) {
                            console.log(err);
                        } else if (!users) {
                            console.log('There are no users found')
                        } else {
                            res.send({ users: users });
                        }
                    });
            }
        })
    })
    .post((req, res) => {
        const id = req.params.id;
        const requestFrom = req.body.id;
        //Remove the current user from the other user's pending requests
        User.findByIdAndUpdate(requestFrom, { $pull: { pendingRequests: id } }, { new: true },
            (err, user) => {
                if (err) {
                    console.log(err);
                } else if (!user) {
                    console.log("The other user was not found when removing you from their pending request");
                } else {
                    console.log("You have been removed from their pending requests")
                        //Add the current user to the other users's connections
                    User.findByIdAndUpdate(requestFrom, { $push: { connections: id } }, { new: true },
                        (err, user) => {
                            if (err) {
                                console.log(err);
                            } else if (!user) {
                                console.log("Could not find other user to add connection to");
                            } else {
                                console.log("You were added to the other user's connection");
                                //Remove the other user from the current users' requests
                                User.findByIdAndUpdate(id, { $pull: { requests: requestFrom } }, { new: true },
                                    (err, user) => {
                                        if (err) {
                                            console.log(err);
                                        } else if (!user) {
                                            console.log("Could not find your account");
                                        } else {
                                            console.log("The user was removed from your requests");
                                            //Remove the other user from the current user's pending requests
                                            User.findByIdAndUpdate(id, { $pull: { pendingRequests: requestFrom } }, { new: true },
                                                (err, user) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else if (!user) {
                                                        console.log("Could not find your account");
                                                    } else {
                                                        console.log("The user was removed from your pending requests");
                                                        //Remove the current user from the other user's pending requests
                                                        User.findByIdAndUpdate(requestFrom, { $pull: { pendingRequests: id } }, { new: true },
                                                            (err, user) => {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else if (!user) {
                                                                    console.log("Could not find your account");
                                                                } else {
                                                                    console.log("You were removed from the user's pending requests");
                                                                    //Add the connection request sender to the current user's connections
                                                                    User.findByIdAndUpdate(id, { $push: { connections: requestFrom } }, { new: true },
                                                                        (err, user) => {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            } else if (!user) {
                                                                                console.log("Your account was not found while trying to add to connection");
                                                                            } else {
                                                                                console.log("The user was added to your connections");
                                                                                res.send({ user: user });
                                                                            }
                                                                        });
                                                                }
                                                            });
                                                    }
                                                });
                                        }
                                    });
                            }
                        });
                }
            });
    })
    .patch((req, res) => {
        const id = req.params.id;
        const toRemove = req.body.id;
        //Remove the logged in user from the other user's connections
        User.findByIdAndUpdate(toRemove, { $pull: { connections: id } }, { new: true }, (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The other user could not be found while deleting from connections");
            } else {
                console.log("You were removed from the other user's connections");
                //Remove the other user from the logged in user's connections
                User.findByIdAndUpdate(id, { $pull: { connections: toRemove } }, { new: true }, (err, user) => {
                    if (err) {
                        console.log(err);
                    } else if (!user) {
                        console.log("Could not find your account while deleting the other user from your connections");
                    } else {
                        console.log("The other user was removed from your connections");
                        res.send({ user: user });
                    }
                })
            }
        })


    });

//Send user chats
app.route('/api/chats/:user')
    .get((req, res) => {
        const userId = req.params.user;
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
                        console.log(otherUsers);
                        User.find({ '_id': { $in: otherUsers } }, 'fullName', (err, users) => {
                            if (err) {
                                console.log(err);
                            } else {
                                const chatIds = chats.map(chat => chat._id);
                                //map the unread function to an array of chat ids 
                                send(res, chats, users, chatIds, userId);
                            }
                        });

                    }
                })
            }
        });

    })

//Creates Chat between two users
app.route('/api/chat/:user/:other')
    .get((req, res) => {
        //Check if the other user is in the connections of the current user
        const userId = req.params.user;
        const otherId = req.params.other
        User.findById(userId, (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The current user was not found while checking if connections exists");
            } else {
                console.log(user);
                const connections = user.connections;
                if (connections.includes(mongoose.Types.ObjectId(otherId))) {
                    // Find the chat between the current user and the other user
                    Chat.findOne({
                        between: {
                            $all: [mongoose.Types.ObjectId(userId),
                                mongoose.Types.ObjectId(otherId)
                            ]
                        }
                    }, (err, chat) => {
                        if (err) {
                            console.log("There was an error with the database 690");
                            console.log(err);
                        } else if (!chat) {
                            //If the chat was not found, create it and add it to both users chat field
                            Chat.create({ between: [userId, otherId] }, (err, chat) => {
                                if (err) {
                                    console.log("There was an error with the database while creating the chat");
                                    console.log(err);
                                } else {
                                    console.log("The chat was created");
                                    //Add the chat to the current user's document
                                    User.findByIdAndUpdate(otherId, { $push: { chats: chat._id } }, { new: true },
                                        (err, otherUser) => {
                                            if (err) {
                                                console.log(err);
                                            } else if (!otherUser) {
                                                console.log("The current user could not be found");
                                            } else {
                                                console.log("The chat was added to the other user's document");
                                                //Add the chat to the other user's document
                                                User.findByIdAndUpdate(userId, { $push: { chats: chat._id } }, { new: true },
                                                    (err, currentUser) => {
                                                        if (err) {
                                                            console.log(err);
                                                        } else if (!currentUser) {
                                                            console.log("The other user could not be found");
                                                        } else {
                                                            console.log("The chat was added to the current user's document");
                                                            // res.send({ chat: chat });
                                                            //Return the chats of the current user and the name and id of the other users in the chat
                                                            const chats = currentUser.chats.map(chat => chat.toString());
                                                            Chat.find({ _id: { $in: chats } }, (err, chats) => {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    const otheruserIds = chats.map(chat => chat.between.filter(id => id.toString() !== userId)).map(id => id.toString());
                                                                    // let otheruserIds = between;
                                                                    // otheruserIds = otheruserIds.filter(id => id !== userId);
                                                                    console.log(`other user id ${otheruserIds}, user id: ${userId}`);
                                                                    User.find({ '_id': { $in: otheruserIds } }, ['_id', 'fullName'], (err, users) => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        } else {
                                                                            res.send({ chats: chats, otherUsers: users });
                                                                        }
                                                                    });

                                                                }
                                                            });
                                                        }
                                                    });
                                            }
                                        });
                                }
                            });
                        } else {
                            //Send the chat and the corresponding user to the client if it was found
                            console.log("The chat was found");
                            const chatIds = user.chats.map(chat => chat._id.toString());
                            // const chats = user.chats;
                            Chat.find({ _id: { $in: chatIds } }, (err, chats) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    const otheruserIds = chats.map(chat => chat.between.filter(id => id.toString() !== userId)).map(id => id.toString());
                                    // let otheruserIds = between;
                                    // otheruserIds = otheruserIds.filter(id => id !== userId);
                                    console.log(`other user id ${otheruserIds}, user id: ${userId}`);
                                    User.find({ '_id': { $in: otheruserIds } }, ['_id', 'fullName'], (err, users) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            res.send({ chats: chats, otherUsers: users });
                                        }
                                    });

                                }
                            });
                        }
                    });
                } else {
                    //You are not connected to the user 
                }
            }
        });

    });



//This gets the messages from a certain chat
app.route('/api/messages/:id')
    .get((req, res) => {
        const chatId = req.params.id;
        Chat.findById(chatId, (err, chat) => {
            if (err) {
                console.log(err);
            } else if (!chat) {
                console.log("There was no chat found");
            } else {
                const messages = chat.messages.map(message => message.toString());
                Message.find({ '_id': { $in: messages } }, (err, messages) => {
                    if (err) {
                        console.log(err);
                    } else if (!messages) {
                        console.log("There were no messages found");
                    } else {
                        console.log(`these are the messages in a particular chat with the id given ${messages}`);
                        res.send({ messages: messages });
                    }
                });
            }
        });
    });

server.listen(port, () => {
    console.log(`Server up and running at ${port}`);
});

//This handles the sending of the unreads to the client
async function send(res, chats, users, chatIds, userId) {
    await forIds(chatIds, userId)
        .then(unreads => {
            res.send({ chats: chats, otherUsers: users, unreads: unreads });
        })
        .catch(err => console.log(err));
};


//This function does the mapping 

async function forIds(chatIds, userId) {
    // let msgArray = [];
    let msgArray = await Promise.all(chatIds.map(async chatId => {
        try {
            return await showUnread(chatId, userId);
        } catch (err) {
            console.log(err);
        }
    }));
    return msgArray;
};


//Function that returns the number of unread messages in certain chat
//This takes a chatId and UserId
async function showUnread(chatId, userId) {
    const chatIdString = chatId.toString();
    try {
        const chatMessages = await Chat.findById(chatIdString, 'messages');
        // console.log("Chat messages");
        // console.log(chatMessages);
        const messages = await findMessages(chatMessages.messages, userId);
        console.log(messages);
        return messages;
    } catch (err) {
        console.log(err);
    };
};


//This is to find the messages from the chat Ids
async function findMessages(messageIds, userId) {
    // console.log("These are the messages ids");
    // console.log(messageIds);
    try {
        const messages = await Message.find({ _id: { $in: messageIds } });
        const count = messages.filter(msg => msg.sender.toString() !== userId).length;
        console.log(count);
        return count;
    } catch (err) {
        console.log(err);
    };
};