const router = require("express").Router();


router.post("/", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
    });
    res.send({ response: "logged out" });
});


module.exports = router;