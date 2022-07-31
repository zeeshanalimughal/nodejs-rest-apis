const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    roomId: { type: String },
    messages: [{
        senderId: { type: String },
        message: { type: String }
    }]

},
    { timestamps: true })

module.exports = mongoose.model("Chat", chatSchema);