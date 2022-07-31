require("dotenv").config()
const Car = require('../model/car')
const jwt = require('jsonwebtoken');
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);
const path = require('path');
const multer = require('multer');
const express = require('express');
var url = require('url');

const app = express();
app.use(express.static('../uploads'));





exports.addCar = async (req, res) => {
    app.use(express.static(__dirname + '../public'));
    const uploadPath = path.join(__dirname, '../uploads');
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
    var upload = multer({
        storage: storage
    }).array('image', 5)

    upload(req, res, (err) => {
        if (err) {
            return res.send('somthing went wrong');
        } else {
            const { brand, modal, seats, image, user_id } = req.body;
            let fileArray = [];
            for (let i = 0; i < (req.files).length; i++) {
                fileArray.push(req.files[i].filename);
            }
            // res.send("Uplodaed success")
            const car = new Car({
                brand,
                modal,
                seats,
                images: fileArray,
                user: user_id
            })
            car.save().then(() => {
                return res.status(200).json({ message: "Car Registered successfully", status: true })
            }).catch((err) => {
                return res.status(500).json({ message: "Something went wrong", status: false, ERROR: err.messages })
            })
        }
    });
}









exports.getCars = async function (req, res) {
    if (!req.body._id || req.body._id === '') { res.json({ message: "user id not provied", status: false }) } else {
        try {
            const cars = await Car.find({});
            if (cars) {
                return res.status(200).json({ cars, status: true })
            } else {
                res.status(200).json({ Error: error.message, status: false })
            }
        } catch (error) {
            res.status(200).json({ message: "Something went wrong", status: false })
        }
    }

}









exports.getCarsOfPickers = async (req, res) => {
    app.use(express.static(__dirname + '../uploads'));
    // app.use("/uploads", express.static(__dirname + '../uploads'))
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    try {
        if (!req.body._id || req.body._id === '') { res.json({ message: "user id not provied", status: false }) } else {
            const pickerCars = await Car.find({ user: req.body._id })
            for (let j = 0; j < pickerCars.length; j++) {
                for (let k = 0; k < pickerCars[j].images.length; k++) {
                    pickerCars[j].images[k] = process.env.FILE_UPLOAD_HOSTNAME + pickerCars[j].images[k];
                }
            }
            return res.status(200).json({ pickerCars, message: "Successs", status: true })
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong Or User ID Not Valid", ERROR: error.message, status: false })
    }
}









exports.deleteCar = async (req, res) => {
    if (!req.body.user_id || req.body.user_id === '') { res.json({ message: "user id not provied", status: false }) } else {
        await Car.remove({ user: req.body.user_id }).then(() => {
            return res.status(200).json({ message: "Car Deleted Successfully", status: true })
        }).catch(err => {
            res.status(500).json({ message: "Something went wrong Or User ID Not Valid", ERROR: err.message, status: false })
        })
    }

}