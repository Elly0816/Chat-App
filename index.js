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
    userName: String,
    firstName: String,
    lastName: String,
    fullName: String,
    email: String,
    password: String,
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
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
app.get('/profile/:id', (req, res) => {
    const id = req.params.id;
    User.findById(id, (err, user) => {
        if (err) {
            console.log(err);
        } else if (!user) {
            console.log("This user does not exist");
            res.send({ response: '404 Not Found!' });
        } else {
            console.log(`This is the user: ${user}`);
            res.send({ response: user });
        }
    });
});




server.listen(port, () => {
    console.log(`Server up and running at ${port}`);
});