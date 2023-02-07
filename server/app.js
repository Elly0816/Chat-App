const { app, server } = require('./socket');
// const { User, Message, Chat } = require('./schemas.js');
// const { send, authenticateToken } = require('./functions.js');
// const jwt = require('jsonwebtoken');
// require('dotenv').config({ path: '../.env' });
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
const chatRoute = require("./routes/chat.js");
const chatsRoute = require("./routes/chats.js");
const connectionRoute = require("./routes/connection.js");
const messagesRoute = require("./routes/messages.js");
const pendingRoute = require("./routes/pendingRequest.js");
const profileRoute = require("./routes/profile.js");
const uploadRoute = require("./routes/profImgUpload.js");
const requestRoute = require("./routes/request.js");
const userRoute = require("./routes/user.js");
const loginRoute = require("./routes/login.js");
const logoutRoute = require("./routes/logout.js");
const registerRoute = require("./routes/register.js");

const port = process.env.PORT || 5000;


/*

                ROUTES

    
                Each route except the register, login and logout routes
                needs to authenticate the Token sent in the header of
                the request.

*/


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'), (err) => {
        res.status(500).send(err);
    });
});

/*This is the register route */
app.use('/api/register', registerRoute);


/*This is the login route */
app.use('/api/login', loginRoute);



// Get current user details
app.use('/api/user', userRoute);



/*Logout route */
app.use('/api/logout', logoutRoute)




/*Profile route*/
/*Get returns the user details to the client while Post edits the user info such as name and email */
app.use('/api/profile', profileRoute);


/*Handle connection requests */
app.use("/api/request", requestRoute);



/*Route to handle pending requests by deleting them */
app.use('/api/pending-requests', pendingRoute);


app.use("/api/connection", connectionRoute);


//Send user chats
app.use('/api/chats', chatsRoute);


//Creates Chat between two users

app.use('/api/chat', chatRoute);



//This gets the messages from a certain chat
app.use('/api/messages', messagesRoute);


//This route is for uploading your profile picture
app.use('/api/profImgUpload', uploadRoute);


server.listen(port, () => {
    console.log(`Server up and running at ${port}`);
});