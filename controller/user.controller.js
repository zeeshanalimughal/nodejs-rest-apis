require("dotenv").config()
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);
const path = require('path');
const multer = require('multer');
const express = require('express');
const app = express();
const fs = require('fs')






exports.register = async (req, res) => {

    try {
        const { name, phone, password } = req.body
        if (name && phone && password) {

            // Validate Phone
            function validatePhoneNumber(phone) {
                // var phoneno = /^([0-9]{11,})$/;
                var phoneno = /^([0-9]{1,2})\)?([0-9]{10,})$/;
                if (phone.match(phoneno)) {
                    return true;
                } else {
                    return false;
                }
            }

            // Validate password
            function validatePassword(password) {
                var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
                if (!re.test(password)) {
                    return false;
                }
            }

            if (validatePassword(password) === false) {
                return res.status(402).json({ message: "password must be min 6 letter, with at least a symbol, upper and lower case letters and a number", status: false });
            }


            if (!validatePhoneNumber(phone)) {
                return res.status(402).json({ message: "Enter Valid Phone Number like: '923000000000'", status: false });
            }

            // Chekc if email already exists
            const oldUser = await User.findOne({ phone: phone });
            if (oldUser) {
                return res.status(201).json({ message: "Account Already Exist", status: false });
            }

            const salt = await bcrypt.genSalt(10);
            encryptedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                name,
                phone,
                password: encryptedPassword,
            })
            if (user) {
                const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, { expiresIn: '10h' })
                user.token = token;
                const { password, __v, otp, ...data } = await user._doc;
                return res.status(201).json({ data: { ...data }, message: "Registered Succcessfylly", status: true });
            }
            res.status(402).json({ message: 'Something went wrong while saving data', status: false })
        }
        res.status(401).json({ message: 'All the input fields are required', status: false })
    } catch (error) {
        res.status(500).json("something forbidden")
    }
}










exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!(phone && password)) {
            res.status(403).json({
                message: "Wrong Credentials",
                status: false
            })
        }
        const user = await User.findOne({ phone: phone });
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ user_id: user._id, phone }, process.env.TOKEN_KEY, { expiresIn: '10h' })
            user.token = token;
            const { password, otp, __v, job, pic, education, ...data } = await user._doc;
            res.status(200).json({ data: { ...data }, message: "Login successfully", status: true });
        } else {
            return res.status(200).json({ message: "Wrong Credentials, account not exists", status: false });
        }
    } catch (error) {
        return res.status(500).json({ message: "Request Forbidden", error: error.message, status: false });
    }
}










exports.validateReset = async (req, res) => {
    try {
        if (!req.body.phone) {
            return res.status(401).json({ message: "Please provide phone number.", status: false });
        }
        const user = await User.findOne({ phone: req.body.phone });
        if (user) {
            var seq = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
            user.otp = seq;
            await User.findOneAndUpdate({ phone: req.body.phone }, {
                $set: { otp: user.otp }
            }, { new: true }).then(async (updatedUser) => {
                const newOtp = updatedUser.otp;
                res.status(201).json({ success: "OTP send Successfully", otp: newOtp, status: true });
                // await client.messages
                //     .create({
                //         body: 'Your OTP is: ' + newOtp,
                //         from: '+13165319161',
                //         to: '+' + updatedUser.phone
                //     })
                //     .then(message => {
                //         res.status(201).json({ success: "OTP send Successfully", otp: newOtp, status: true });

                //     }).catch(err => {
                //         res.send(err.message)
                //     })
            }).catch(err => {
                res.status(400).json({ error: err })
            })

        } else {
            res.status(403).json({
                message: "Wrong Credentials",
                status: false
            })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



exports.matchOtp = async (req, res) => {
    if ((req.body.otp) == "") {
        return res.status(401).json({ message: "Please provide and otp", status: false });
    }
    const otpMatch = await User.findOne({ otp: req.body.otp });
    if (otpMatch) {
        const { password, otp, _id, __v, name, ...data } = otpMatch._doc
        return res.status(200).json({ ...data, message: "OPT Varified Successfully", status: true });
    } else {
        return res.status(402).json({ message: "invalid OTP", status: false });
    }
}










exports.resetPassword = async (req, res) => {
    try {
        if ((req.body.newPassword) === "" || req.body.phone === "") {
            return res.status(401).json({ message: "Please provide phone and new Password", status: false });
        }
        const userExists = await User.findOne({ phone: req.body.phone })
        if (userExists) {
            const salt = await bcrypt.genSalt(10);
            encryptedPassword = await bcrypt.hash(req.body.newPassword, salt);
            await User.findOneAndUpdate({ phone: req.body.phone }, {
                $set: { password: encryptedPassword }
            }, { new: true }).then(() => {
                res.status(201).json({ success: "Password Reset Successfully", status: true });

            }).catch(err => {
                res.status(400).json({ error: err })
            });

        } else {
            return res.status(401).json({ message: "Wrong Credentials, account not exists", status: false });
        }

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}














exports.updateProfile = async (req, res) => {
    app.use(express.static(__dirname + '../public'));
    const uploadPath = path.join(__dirname, '../uploads');
    const oldUser = await User.findOne({ id: req.body._id });
    // if (oldUser.pic !== "") {
    //     try {
    //         fs.unlink(uploadPath + "/" + oldUser.pic, (err) => {
    //             if (err) {
    //                 console.error(err);
    //             }
    //         });
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }

    var picName = "";
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {

            cb(null, uploadPath)
        },
        filename: function (req, file, cb) {
            picName = new Date().getTime() + "-" + file.originalname;
            cb(null, picName)
        }
    })
    const upload = multer({ storage: storage }).single("image");
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send({ message: "Something went wrong!", status: false });
        }
        if (!req.file) {
            return res.status(400).json({
                message: "No File Recived",
                status: false,
            });
        } else {
            const data = req.body
            console.log(data)
            if (!data) 
            { res.json({ message: "user id not provied", status: false }) 
         }
            else {
                app.use(express.static(__dirname + '../uploads'));
                app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
                const { _id, address, education, job, name, image } = req.body;
                User.findOneAndUpdate(
                    { _id: '61dbc7c7fb919b03ea76393f' },
                    {
                        name: name,
                        job: job,
                        education: education,
                        address: address,
                        pic: picName,
                    }, { new: true }, // options
                    function (err, updatedUser) { // callback
                        if (err) res.json({ message: "Error While Updating User", ERROR: err, status: false });
                        // res.send(updatedUser)
                        const { password, otp, __v, ...data } = updatedUser._doc
                        data.pic =process.env.FILE_UPLOAD_HOSTNAME +data.pic
                        return res.status(201).json({ data: { ...data }, message: "Updated Successfully", status: true });

                    });
            }
        }
    });
}












exports.updateStatus = async (req, res) => {
    if (!req.body._id || req.body._id === '') { res.json({ message: "user id not provied", status: false }) } else if (req.body.status == null) { res.json({ message: "user status not recived", status: false }) }
    else {
        if (req.body.status === 0) {
            await User.findByIdAndUpdate(req.body._id, {
                status: 1,
            }).then((newUser) => {
                res.status(200).json({ userStatus: 1, message: "Status Updated", status: true })
            }).catch(err => {
                res.status(400).json({ message: "Something went wrong", status: false, ERROR: err })
            })
        } else if (req.body.status === 1) {
            await User.findByIdAndUpdate(req.body._id, {
                status: 0,
            }).then((newUser) => {
                res.status(200).json({ userStatus: 0, message: "Status Updated", status: true })
            }).catch(err => {
                res.status(400).json({ message: "Something went wrong", status: false, ERROR: err })
            })
        } else {
            res.status(400).json({ message: "Not a Valid Status", status: false, ERROR: err })
        }
    }
}













exports.getProfilePicture = async (req, res) => {
    app.use(express.static(__dirname + '../uploads'));
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    if (!req.body.user_id || req.body.user_id === '') { res.json({ message: "user id not provied", status: false }) } else {
        const user = await User.findOne({_id: req.body.user_id});
        if(user.pic!==""){
            user.pic = process.env.FILE_UPLOAD_HOSTNAME +user.pic
            res.status(200).json({pic:user.pic,message:"Seccuss", status:true})
        }else{
            res.status(200).json({ message: "Profile picture not found", status:false }) 
        }
    }
}