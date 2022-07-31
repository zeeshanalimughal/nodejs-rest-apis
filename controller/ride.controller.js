const Ride = require("../model/ride.model")
const User = require('../model/user');
const Car = require('../model/car');
const express = require('express');
const app = express();
const path = require('path');
var mongoose = require('mongoose');




exports.addRide = async (req, res) => {
    if (!req.body.user_id || req.body.user_id === '') { return res.json({ message: "user id not provied", status: false }) }

    const { pickPoint, dropPoint, date, time, user_id } = req.body;
    if (!pickPoint || !dropPoint || !date || !time || !user_id) {
        return res.json({ message: "provide all details", status: false })
    } else {
        const checkUserExists = await User.findOne({ _id: user_id })
        if (checkUserExists) {
            const ride = await new Ride({
                pickPoint,
                dropPoint,
                date,
                time,
                user: user_id
            })
            await ride.save().then(() => {
                res.status(200).json({ message: "Ride added sucessfully", status: true })
            }).catch(err => {
                res.status(500).json({ message: "Something went wrong", status: false, error: err.message })
            })
        } else {
            res.status(200).json({ message: "User not exist with given id", status: false })
        }
    }
}













exports.getAllRide = async (req, res) => {
    try {
        if (!req.body.user_id || req.body.user_id === '') { res.json({ message: "user id not provied", status: false }) } else {
            Ride.find({ user: req.body.user_id }).populate('user').exec(function (err, ride) {
                if (err) { return res.status(200).json({ ERROR: err.message, status: false }); }
                if (ride.length > 0) {
                    // const len = pickerCars.length;
                    return res.status(200).json({ ride, message: "Successs", status: true })
                }
                else {
                    return res.status(200).json({ message: "No Data Found", status: false })
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong Or User ID Not Valid", ERROR: error.message, status: false })
    }
}











exports.getAllDataOfPicker = async (req, res) => {
    try {
        app.use(express.static(__dirname + '../uploads'));
        app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
        await User.find({}).then(async (user) => {
            if (user.length > 0) {
                for (let i = 0; i < user.length; i++) {
                    const car = await Car.find({ user: user[i]._id })
                    for (let j = 0; j < car.length; j++) {
                        user[i].seats.push(car[j].seats)
                    }
                    const rides = await Ride.find({ user: user[i]._id })
                    if (rides) {
                        for (let k = 0; k < rides.length; k++) {
                            user[i].rides.push(rides[k])
                        }
                    }
                    user[i].pic = process.env.FILE_UPLOAD_HOSTNAME + user[i].pic
                }
                // res.send(user);
                // const len = pickerCars.length;
                return res.status(200).json({ user, message: "Successs", status: true })
            }
            else {
                return res.status(200).json({ message: "No Data Found", status: false })
            }
        }).catch(function (err) {
            res.status(500).json({ message: "Something went wrong Valid", ERROR: err.message, status: false })
        })
        // }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", ERROR: error.message, status: false })
    }
}











exports.getAllDataOfSinglePicker = async (req, res) => {
    try {
        if (!req.body.user_id || req.body.user_id === '') { res.json({ message: "user id not provied", status: false }) } else {
            app.use(express.static(__dirname + '../uploads'));
            app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
            await User.findOne({ _id: req.body.user_id }).then(async (user) => {
                if (user) {
                    const car = await Car.findOne({ user: user._id })
                    for (let k = 0; k < car.images.length; k++) {
                        car.images[k] = process.env.FILE_UPLOAD_HOSTNAME + car.images[k];
                    }
                    user.seats = car
                    const rides = await Ride.findOne({ user: user._id })
                    user.rides = rides
                    user.pic = process.env.FILE_UPLOAD_HOSTNAME + user.pic

                    // res.send(user);
                    // const len = pickerCars.length;
                    return res.status(200).json({ user, message: "Successs", status: true })
                }
                else {
                    return res.status(200).json({ message: "No Data Found", status: false })
                }
            }).catch(function (err) {
                res.status(500).json({ message: "Something went wrong Valid", ERROR: err.message, status: false })
            })
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", ERROR: error.message, status: false })
    }
}
















exports.sendRideRequest = async (req, res) => {
    if (!req.body.user_id || req.body.user_id === '') { res.json({ message: "user id not provied", status: false }) }
    else if (!req.body.picker_id || req.body.picker_id === '') { res.json({ message: "Picker id not provied", status: false }) } else {
        let FLAG = false;
        let checkRequestExists = await User.findOne({ _id: req.body.picker_id });
        if (checkRequestExists.requests && checkRequestExists.requests.length > 0) {
            checkRequestExists.requests.forEach(async (request) => {
                if (request.requestFrom == req.body.user_id && request.reqStatus == "pending") {
                    FLAG = false;
                } else {
                    FLAG = true;
                }
            });
            if (FLAG) {
                await User.findByIdAndUpdate({ _id: req.body.picker_id },
                    {
                        $push: { requests: { requestFrom: req.body.user_id, reqStatus: 'pending' } }
                    }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }).then(() => {
                    res.status(200).json({ message: "Request send successfully", status: true });
                }).catch(err => {
                    res.status(500).json({ message: "Something went wrong Valid", ERROR: err.message, status: false })
                })
            } else {
                return res.status(200).json({ message: "You are already requested and it is pending", status: true });
            }
        } else {
            await User.findByIdAndUpdate({ _id: req.body.picker_id },
                {
                    $set: { requests: { requestFrom: req.body.user_id, reqStatus: 'pending' } }
                }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }).then(() => {
                res.status(200).json({ message: "Request send successfully 222", status: true });
            }).catch(err => {
                res.status(500).json({ message: "Something went wrong Valid", ERROR: err.message, status: false })
            })
        }
    }
}











exports.getRideRequest = async (req, res) => {
    try {
        if (!req.body.user_id || req.body.user_id === '') { res.json({ message: "user id not provied", status: false }) } else {
            app.use(express.static(__dirname + '../uploads'));
            app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
            await User.findOne({ _id: req.body.user_id }).then(async (user) => {
                if (user.reqStatus && user.reqStatus == "pending") {
                    if (user.requestFrom && user.requestFrom !== null) {
                        const car = await Car.findOne({ user: user._id })
                        user.seats = car.seats
                        const userData = await User.findOne({ _id: user.requestFrom });
                        userData.pic = process.env.FILE_UPLOAD_HOSTNAME + userData.pic
                        const rides = await Ride.findOne({ user: user._id })
                        user.rides = rides
                        user.pic = process.env.FILE_UPLOAD_HOSTNAME + user.pic
                        user.requestFrom = userData
                        return res.status(200).json({ user, message: "Successs", status: true })
                    } else {
                        return res.status(200).json({ message: "No Request Found", status: false })
                    }
                }
                else {
                    return res.status(200).json({ message: "No Request Found", status: false })
                }
            }).catch(function (err) {
                res.status(500).json({ message: "Something went wrong Valid", ERROR: err.message, status: false })
            })
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", ERROR: error.message, status: false })
    }
}











exports.requestAccept = async (req, res) => {
    if (!req.body.request_id || req.body.request_id === '') { res.json({ message: "request id not provied", status: false }) }
    else if (!req.body.picker_id || req.body.picker_id === '') { res.json({ message: "Picker id not provied", status: false }) } else {
        const {picker_id,request_id} = req.body;
        try {
            const picker = await User.findOne({ _id: picker_id });
            const requests=[];
            picker.requests.forEach(async (request) => {
                requests.push(request)
            });
           for(let i=0; i<requests.length; i++){
               if(requests[i]._id==request_id){
                    picker.requests[i].reqStatus = "accepted"
                     await User.updateOne({ _id:picker_id},{
                      $set:{requests:requests}
                    }).then(() => {
                        res.status(200).json({ message: "Request Accepted successfully", status: true });
                    }).catch(err => {
                        res.status(500).json({ message: "Something went wrong", ERROR: err.message, status: false })
                    })
               }
            }
        } catch (err) {
            res.status(500).json({ message: "Something went wrong", ERROR: err.message, status: false })
        }
    }
}











exports.requestReject = async (req, res) => {
    if (!req.body.request_id || req.body.request_id === '') { res.json({ message: "request id not provied", status: false }) }
    else if (!req.body.picker_id || req.body.picker_id === '') { res.json({ message: "Picker id not provied", status: false }) } else {
        const {picker_id,request_id} = req.body;
        try {
            const picker = await User.findOne({ _id: picker_id });
            const requests=[];
            picker.requests.forEach(async (request) => {
                requests.push(request)
            });
           for(let i=0; i<requests.length; i++){
               if(requests[i]._id==request_id){
                    picker.requests[i].reqStatus = "rejected"
                     await User.updateOne({ _id:picker_id},{
                      $set:{requests:requests}
                    }).then(() => {
                        res.status(200).json({ message: "Request rejected successfully", status: true });
                    }).catch(err => {
                        res.status(500).json({ message: "Something went wrong", ERROR: err.message, status: false })
                    })
               }
            }
        } catch (err) {
            res.status(500).json({ message: "Something went wrong", ERROR: err.message, status: false })
        }
    }
}











exports.getChatUsers = async (req, res) => {
    if (!req.body.user_id || req.body.user_id === '') { res.json({ message: "user id not provied", status: false }) } else {
        const picker = await User.findOne({ requestFrom: req.body.user_id });
        if (picker.reqStatus == "accepted") {
            picker.pic = process.env.FILE_UPLOAD_HOSTNAME + picker.pic
            res.status(200).json({ picker: [picker], status: true })
        } else {
            res.status(200).json({ message: "Nothing found", status: false })
        }
    }
}











exports.getUserForChat = async (req, res) => {
    if (!req.body.picker_id || req.body.picker_id === '') { res.json({ message: "picker id not provied", status: false }) } else {
        const picker = await User.findOne({ _id: req.body.picker_id });
        if (picker.reqStatus && picker.reqStatus == "accepted") {
            const userForChat = await User.findOne({ _id: picker.requestFrom });
            if (userForChat) {
                res.status(200).json({ user: [userForChat], status: true })
            }
            // picker.pic= process.env.FILE_UPLOAD_HOSTNAME +picker.pic
        } else {
            res.status(200).json({ message: "Nothing found", status: false })
        }
    }
}

