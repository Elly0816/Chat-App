const { User, Message, Chat } = require('./database');


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
    // let chatIds = chatIds;
    if (typeof chatIds == 'string') {
        chatIds = [chatIds];
    };
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
    // console.log(chatId);
    const chatIdString = chatId.toString();
    try {
        const chatMessages = await Chat.findById(chatIdString, 'messages');
        // console.log("Chat messages");
        // console.log(chatMessages);
        const messages = await findMessages(chatMessages.messages, userId);
        // console.log(messages);
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
        const count = messages.filter(msg => msg.sender.toString() !== userId).filter(msg => msg.seen === 'false').length;
        // console.log(count);
        return count;
    } catch (err) {
        console.log(err);
    };
};

async function messagesHaveBeenRead(messages) {
    let messagesMarkedRead = await messages.map(message => read(message));
    return messagesMarkedRead;
}

//This function handles the changing of all
async function read(message) {
    let messageDoc = await Message.findOneAndUpdate({ _id: message._id }, { seen: true }, { returnOriginal: false });
    return messageDoc;
};

//This emits the read to the user socket
async function socketSend(socket, chats, users, chatIds, userId, ) {
    await forIds(chatIds, userId)
        .then(unreads => {
            // res.send({ chats: chats, otherUsers: users, unreads: unreads });
            socket.emit('read', { chats: chats, otherUsers: users, unreads: unreads });
            // io.to(otherUserSocket).emit('new message', chatIds);
            // console.log(unreads);
        })
        .catch(err => console.log(err));


};

//This emits the read to the other user socket
async function otherSocketSend(otherUserId, io) {
    const user = await User.findById(otherUserId);
    const chatIds = user.chats;
    const socket = user.socketId;
    // console.log(`The socket id for the ${user.fullName} is ${socket}`);
    // console.log(`The above user is the other user.`);\
    const chats = await Chat.find({ _id: { $in: chatIds } });
    const otherUsersIds = chats.map(chat => chat.between.filter(id => id.toString() !== otherUserId)).map(id => id.toString());
    const otherUsers = await User.find({ _id: { $in: otherUsersIds } });
    // console.log('other socket send');
    await forIds(chatIds, user._id)
        .then(unreads => {
            // res.send({ chats: chats, otherUsers: users, unreads: unreads });
            io.to(socket).emit('read', { chats: chats, otherUsers: otherUsers, unreads: unreads });
            // io.to(otherUserSocket).emit('new message', chatIds);
            // console.log(unreads);
        })
        .catch(err => console.log(err));
};


module.exports = {
    otherSocketSend,
    socketSend,
    messagesHaveBeenRead,
    send
};