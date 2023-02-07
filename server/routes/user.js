const router = require('express').Router();
const { authenticateToken } = require("../functions.js");
const { User } = require("../schemas.js");
const jwt = require('jsonwebtoken');





router.get("/:id", (req, res) => {
    if (authenticateToken(req, res, jwt)) {
        const id = req.params.id;
        User.findById(id, (err, user) => {
            if (err) {
                console.log("There was an error with the database 328");
                console.log(err);
            } else if (!user) {
                console.log("There was no user found in the database");
                res.send({ user: 'None' })
            } else {
                res.send({ user: user });
            }
        })
    }
});


module.exports = router;