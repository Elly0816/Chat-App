const router = require('express').Router();
const { User, Chat } = require("../schemas.js");
const { authenticateToken } = require("../functions");
const jwt = require("jsonwebtoken");



router.get("/:user/:other", (req, res) => {
    if (authenticateToken(req, res, jwt)) {
        //Check if the other user is in the connections of the current user
        const userId = req.params.user;
        const otherId = req.params.other
        User.findById(userId, (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The current user was not found while checking if connections exists");
            } else {
                // console.log(user);
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
                                                                    User.find({ '_id': { $in: otheruserIds } }, ['_id', 'img', 'fullName'], (err, users) => {
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
                                    User.find({ '_id': { $in: otheruserIds } }, ['_id', 'img', 'fullName'], (err, users) => {
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
    }
});

module.exports = router;