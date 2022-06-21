const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const passportLocalMongoose = require('passport-local-mongoose');
const { Server } = require('socket.io');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'keyboard cat',
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

/*Add passport local mongoose to the user schema */
userSchema.plugin(passportLocalMongoose);

/*Create the models*/
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Chat = mongoose.model('Chat', chatSchema);

/*Authenticate with local strategy */
passport.use(new LocalStrategy(User.authenticate()));

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

    socket.on('send', (arg) => {
        console.log(arg);
        socket.emit('send', arg);
    });
});


/*

                ROUTES



*/

app.post('/register', (req, res) => {
    const data = req.body;
    console.log(data);
    res.send(data);
});

app.post('/login', (req, res) => {
    const data = req.body;
    console.log(data);
    res.send(data);
});




server.listen(port, () => {
    console.log(`Server up and running at ${port}`);
});