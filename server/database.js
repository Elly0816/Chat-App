const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
require('dotenv').config({ path: '../.env' });


const url = process.env.NODE_ENV === 'production' ? process.env.MONGO : "mongodb://localhost:27017/chatDB";


mongoose.connect(url);


/*Message Schema*/
const messageSchema = new mongoose.Schema({
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    time: { type: Date, default: Date.now },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    seen: { type: String, default: 'false' }
});

/*Schema for chats*/
const chatSchema = new mongoose.Schema({
    between: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

/*User Schema */
const userSchema = new mongoose.Schema({
    img: {
        data: Buffer,
        contentType: String
    },
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

module.exports = {
    User,
    Message,
    Chat,
    passport
};