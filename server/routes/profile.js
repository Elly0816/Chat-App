const { User } = require("../schemas.js");
const router = require("express").Router();
const { authenticateToken } = require("../functions.js");
const jwt = require('jsonwebtoken');



router.get("/:id", (req, res) => {
    if (authenticateToken(req, res, jwt)) {
        const id = req.params.id;
        User.findById(id, ['_id', 'img', 'firstName', 'lastName', 'fullName', 'email', 'connections', 'requests', 'pendingRequests'], (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("This user does not exist");
                res.send({ response: 'User not found!' });
            } else {
                // console.log(`This is the user: ${user}`);
                res.send({ response: user });
            }
        });
    }
});



router.patch("/:id", (req, res) => {
    if (authenticateToken(req, res, jwt)) {
        const id = req.params.id;
        User.findByIdAndUpdate(id, { $set: req.body }, { new: true, projection: ['_id', 'img', 'firstName', 'lastName', 'fullName', 'email'] }, (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("There was no user found");
                res.send({ response: 'User not found' });
            } else {
                console.log('The user was updated successfully');
                res.send({ response: user });
            }
        });
    }
});



module.exports = router;