const router = require('express').Router();
const { User, Chat } = require("../schemas.js");
const { send, authenticateToken } = require("../functions.js");
const jwt = require("jsonwebtoken");




router.get('/:user', (req, res) => {
    if (authenticateToken(req, res, jwt)) {
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
                        User.find({ '_id': { $in: otherUsers } }, ['fullName', 'img'], (err, users) => {
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
    }
});

module.exports = router;