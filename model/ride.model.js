const mongoose = require('mongoose');
const rideSchema = new mongoose.Schema({
    pickPoint: { type: String, required: true },
    dropPoint: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }
})
module.exports = mongoose.model("Ride", rideSchema);