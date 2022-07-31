const userController = require('../controller/user.controller');
const carController = require('../controller/car.controller');
const rideController = require('../controller/ride.controller');
const chatController = require('../controller/chat.controller');
const router = require('express').Router();
const auth = require("../middleware/auth")

// User authentication Routes
router.get('/', (req, res) => {
    res.send("hello");
})

// Auth Routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/validate-reset', userController.validateReset);
router.post('/match-otp', userController.matchOtp);
router.post('/reset-password', userController.resetPassword);
router.post('/update-profile', userController.updateProfile);
router.post('/update-status', userController.updateStatus);
router.post('/getProfilePicture', userController.getProfilePicture);


// Car routes
router.post("/addCar", carController.addCar);
router.post("/getCars", carController.getCars);
router.post("/getCarsOfPickers", carController.getCarsOfPickers);
router.post("/deleteCar", carController.deleteCar);

//  Ride routes

router.post('/addRide', rideController.addRide)

router.post('/getAllRide', rideController.getAllRide)
router.get("/getAllDataOfPicker", rideController.getAllDataOfPicker)
router.post("/getAllDataOfSinglePicker", rideController.getAllDataOfSinglePicker)

router.post("/sendRideRequest", rideController.sendRideRequest)
router.post("/getRideRequest", rideController.getRideRequest)

router.post("/requestAccept", rideController.requestAccept)
router.post("/requestReject", rideController.requestReject)

router.post("/requestReject", rideController.requestReject)

router.post("/getChatUsers",rideController.getChatUsers)
router.post("/getUserForChat",rideController.getUserForChat)
module.exports = router;