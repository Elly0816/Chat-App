const router = require('express').Router();
const { authenticateToken } = require("../functions.js");
const { User } = require("../schemas.js");
const jwt = require('jsonwebtoken');



router.get("/:id", (req, res) => {
    if (authenticateToken(req, res, jwt)) {
        const id = req.params.id;
        User.findById(id, ['requests', 'pendingRequests'], (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The user does not exist");
                res.send({ response: "This user does not exist" });
            } else {
                /*This is a list of user id's in the requests field */
                const requests = user.requests.map(item => item.toString());
                const pending = user.pendingRequests.map(item => item.toString());
                console.log(requests);
                User.find({ '_id': { $in: requests } }, ['_id', 'img', 'firstName', 'lastName', 'fullName'],
                    (err, users) => {
                        if (err) {
                            console.log(err);
                        } else if (!users) {
                            console.log("There were no users found");
                        } else {
                            User.find({ '_id': { $in: pending } }, ['_id', 'img', 'firstName', 'lastName', 'fullName'],
                                (err, pendings) => {
                                    if (err) {
                                        console.log(err);
                                    } else if (!pendings) {
                                        console.log("There were no users found");
                                    } else {
                                        res.send({ users: users, pending: pendings });
                                    }
                                });
                        }
                    });
                /*This returns an array of users that are in the requests field and user ids in the pending requests field */
            }
        });
    };
});


router.post("/:id", (req, res) => {
    authenticateToken(req, res);
    const id = req.params.id;
    const requestTo = req.body.id;
    //Add current user to other user's requests list
    User.findByIdAndUpdate(requestTo, { $push: { requests: id } }, { new: true },
        (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The user you're sending the request to does not exist");
            } else {
                console.log("The request was sent successfully");
                /*Add the id the request was sent to to the current users' pending requests */
                User.findByIdAndUpdate(id, { $push: { pendingRequests: requestTo } }, { new: true },
                    (err, user) => {
                        if (err) {
                            console.log(err);
                        } else if (!user) {
                            console.log("The user to add the pending request to was not found")
                        } else {
                            console.log("The request was added to your pending request");
                            res.send({ user: user });
                        }
                    });

            }
        });
});


router.patch("/:id", (req, res) => {
    const id = req.params.id;
    const requestFrom = req.body.id;
    //Remove current user from other user's pending request list
    User.findByIdAndUpdate(requestFrom, { $pull: { pendingRequests: id } }, { new: true },
        (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The user the request was sent from was not found");
            } else {
                console.log("You were removed from their pending requests");
                //Remove other user from current user's requests list
                User.findByIdAndUpdate(id, { $pull: { requests: requestFrom } }, { new: true },
                    (err, user) => {
                        if (err) {
                            console.log(err);
                        } else if (!user) {
                            console.log("The user to remove the request from was not found");
                        } else {
                            console.log("You have declined the connection request");
                            res.send({ user: user });
                        }
                    });
            }
        });
});

module.exports = router;