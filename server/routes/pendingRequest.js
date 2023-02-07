const router = require("express").Router();
const { User } = require("../schemas.js");
const jwt = require('jsonwebtoken');



router.patch("/:id", (req, res) => {
    const id = req.params.id;
    const toDelete = req.body.id;
    //Remove the current user from the other user's requests
    User.findByIdAndUpdate(toDelete, { $pull: { requests: id } }, { new: true },
        (err, user) => {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log("The user the request was sent to was not found");
            } else {
                console.log("Your request was removed from the user's list of requests");
                //Remove the other user from the current user's pending requests
                User.findByIdAndUpdate(id, { $pull: { pendingRequests: toDelete } }, { new: true },
                    (err, user) => {
                        if (err) {
                            console.log(err);
                        } else if (!user) {
                            console.log("The user was not found");
                        } else {
                            console.log("The user was removed from your list of pending requests");
                            res.send({ user: user });
                        }
                    })
            }
        })
});





module.exports = router;