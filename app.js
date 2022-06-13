const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chat');

const app = express();
const port = 3000;

/*Build the messages schema and database*/

const msgSchema = new mongoose.Schema({
    from: String,
    message: String,
    to: String,
    date: Date.now
});

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
})

const Message = mongoose.Model

app.listen(port, () => {
    console.log(`Server up and running at ${port}`)
})