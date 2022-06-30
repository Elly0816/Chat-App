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



app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('trust proxy', 1)


const server = http.createServer(app);

/*Creates the websocket */
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT,
        methods: ["GET", "POST"]
    }
});

mongoose.connect('mongodb://localhost:27017/chatDB');

const port = 5000;

/*Message Schema*/

const messageSchema = new mongoose.Schema({
    text: String,
    sender: String,
    receiver: String,
    time: { type: Date, default: Date.now }
});

/*Schema for chats*/
const chatSchema = new mongoose.Schema({
    between: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [messageSchema]
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
    chats: [chatSchema],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
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

    socket.on("disconnect", () => {
        console.log(`user ${socket.id} disconnected from the server`);
    });


    /*This sends a message to the user currently being chatted with */
    socket.on('send', (arg) => {
        console.log(arg);
        socket.emit('send', arg);
    });


    /*This searches the database for a matching username */
    socket.on('search', (arg) => {
        const regex = new RegExp(arg, 'i');
        User.find({ fullName: { $regex: regex } }, (err, users) => {
            if (err) {
                console.log(err);
            } else {
                if (!users) {
                    socket.emit('search', 'No users found');
                } else {
                    socket.emit('search', users);
                }
            }
        });
    });
});


/*

                ROUTES



*/


/*This is the register route */
app.post('/register', (req, res) => {
    const data = req.body;
    console.log(data);
    User.findOne({ username: data.email }, (err, user) => {
        if (err) {
            console.log("There was an error with the database");
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
app.post('/login', (req, res) => {
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


/*Logout route */



/*Profile route*/
/*Get returns the user details to the client while Post edits the user info such as name and email */
app.route('/profile/:id')
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
app.route("/request/:id")
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
                const requests = user.requests;
                const pending = user.pendingRequests;
                const users = requests.map(request => {
                    User.findById(request, ['_id', 'firstName', 'lastName', 'fullName', 'email'], (err, user) => {
                        if (err) {
                            console.log(err);
                        } else if (!user) {
                            console.log("The user in the requests does not exist");
                        } else {
                            console.log("The user in the request was found");
                        }
                    });
                });
                /*This returns an array of users that are in the requests field and user ids in the pending requests field */
                res.send({ users: users, pending: pending });
            }
        });
    })
    .post((req, res) => {
        const id = req.params.id;
        const requestTo = req.body.id;
        User.findByIdAndUpdate(requestTo, { $push: { requests: id } }, (err, user) => {
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
    .delete((req, res) => {
        const id = req.params.id;
        const requestFrom = req.body.id;
    });


app.route("/connection/:id")
    .get().post().delete()


server.listen(port, () => {
    console.log(`Server up and running at ${port}`);
});