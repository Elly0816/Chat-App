const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });
const { User } = require('../schemas.js');
const router = require("express").Router();


router.post("/", (req, res) => {
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
                    // console.log(user);
                    res.send({ token: token, user: user });
                }
            });
        }
    });
});


module.exports = router;