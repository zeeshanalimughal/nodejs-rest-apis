const mongoose = require('mongoose');


const carSchema = new mongoose.Schema({
    brand:{type: String,required: true},
    modal:{type:Number,required: true},
    seats:{type:Number,required: true},
    images:{type:Array},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})


module.exports = mongoose.model("Car", carSchema);