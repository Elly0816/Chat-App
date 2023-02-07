const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = require("express").Router();
const { User } = require("../schemas.js");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()} ${path.extname(file.originalname)}`)
    }
});


const upload = multer({ storage: storage });


router.post("/:id", upload.single('image'), (req, res) => {
    const userId = req.params.id;
    console.log(userId);
    console.log(req.file);
    const imageObject = {
        data: fs.readFileSync(path.join(__dirname + '../uploads/' + req.file.filename)),
        contentType: 'image/png'
    };
    User.findByIdAndUpdate(userId, { $set: { img: imageObject } }, { new: true }, (err, user) => {
        if (err) {
            console.log('There was an error');
        } else if (!user) {
            console.log('The user was not found');
        } else {
            try {
                fs.unlinkSync(path.join(__dirname + '/uploads/' + req.file.filename));
                console.log('Deleted image from storage successfully');
            } catch (err) {
                console.log(err);
            }
            res.send({ response: user });
        }
    })
});

module.exports = router;