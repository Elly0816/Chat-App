const router = require("express").Router()
const { User } = require("../schemas.js");
const { authenticateToken } = require("../functions");
const jwt = require("jsonwebtoken");




router.get('/:id', (req, res) => {
    if (authenticateToken(req, res, jwt)) {
        const id = req.params.id;
        User.findById(id, ['connections'], (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("Your account was not found");
            } else {
                console.log("Your account was found");
                const connections = user.connections.map(connection => connection.toString());
                //Find the users that have id's in the current users' connections
                User.find({ '_id': { $in: connections } }, ['_id', 'img', 'firstName', 'lastName', 'fullName'],
                    (err, users) => {
                        if (err) {
                            console.log(err);
                        } else if (!users) {
                            console.log('There are no users found')
                        } else {
                            res.send({ users: users });
                        }
                    });
            }
        });
    }
});


router.post("/:id", (req, res) => {
    const id = req.params.id;
    const requestFrom = req.body.id;
    //Remove the current user from the other user's pending requests
    User.findByIdAndUpdate(requestFrom, { $pull: { pendingRequests: id } }, { new: true },
        (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The other user was not found when removing you from their pending request");
            } else {
                console.log("You have been removed from their pending requests")
                    //Add the current user to the other users's connections
                User.findByIdAndUpdate(requestFrom, { $push: { connections: id } }, { new: true },
                    (err, user) => {
                        if (err) {
                            console.log(err);
                        } else if (!user) {
                            console.log("Could not find other user to add connection to");
                        } else {
                            console.log("You were added to the other user's connection");
                            //Remove the other user from the current users' requests
                            User.findByIdAndUpdate(id, { $pull: { requests: requestFrom } }, { new: true },
                                (err, user) => {
                                    if (err) {
                                        console.log(err);
                                    } else if (!user) {
                                        console.log("Could not find your account");
                                    } else {
                                        console.log("The user was removed from your requests");
                                        //Remove the other user from the current user's pending requests
                                        User.findByIdAndUpdate(id, { $pull: { pendingRequests: requestFrom } }, { new: true },
                                            (err, user) => {
                                                if (err) {
                                                    console.log(err);
                                                } else if (!user) {
                                                    console.log("Could not find your account");
                                                } else {
                                                    console.log("The user was removed from your pending requests");
                                                    //Remove the current user from the other user's pending requests
                                                    User.findByIdAndUpdate(requestFrom, { $pull: { pendingRequests: id } }, { new: true },
                                                        (err, user) => {
                                                            if (err) {
                                                                console.log(err);
                                                            } else if (!user) {
                                                                console.log("Could not find your account");
                                                            } else {
                                                                console.log("You were removed from the user's pending requests");
                                                                //Add the connection request sender to the current user's connections
                                                                User.findByIdAndUpdate(id, { $push: { connections: requestFrom } }, { new: true },
                                                                    (err, user) => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        } else if (!user) {
                                                                            console.log("Your account was not found while trying to add to connection");
                                                                        } else {
                                                                            console.log("The user was added to your connections");
                                                                            res.send({ user: user });
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
            }
        });
});


router.patch("/:id", (req, res) => {
    const id = req.params.id;
    const toRemove = req.body.id;
    //Remove the logged in user from the other user's connections
    User.findByIdAndUpdate(toRemove, { $pull: { connections: id } }, { new: true }, (err, user) => {
        if (err) {
            console.log(err);
        } else if (!user) {
            console.log("The other user could not be found while deleting from connections");
        } else {
            console.log("You were removed from the other user's connections");
            //Remove the other user from the logged in user's connections
            User.findByIdAndUpdate(id, { $pull: { connections: toRemove } }, { new: true }, (err, user) => {
                if (err) {
                    console.log(err);
                } else if (!user) {
                    console.log("Could not find your account while deleting the other user from your connections");
                } else {
                    console.log("The other user was removed from your connections");
                    res.send({ user: user });
                }
            })
        }
    })
});




module.exports = router;