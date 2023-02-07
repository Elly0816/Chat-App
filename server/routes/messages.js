const router = require("express").Router();
const { Chat, Message } = require("../schemas.js");
const jwt = require('jsonwebtoken');



router.get("/:id", (req, res) => {
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
                    // console.log(`these are the messages in a particular chat with the id given ${messages}`);
                    res.send({ messages: messages });
                }
            });
        }
    });
});

module.exports = router;