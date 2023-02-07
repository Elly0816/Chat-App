const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });
const { User } = require('../schemas.js');
const router = require("express").Router();



router.post("/", (req, res) => {
    const data = req.body;
    console.log(data);
    User.findOne({ username: data.email }, (err, user) => {
        if (err) {
            console.log("There was an error with the database 245");
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
                                    // console.log(user);
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






module.exports = router;