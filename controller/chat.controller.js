const Chat = require('../model/chat')
exports.getAllChats = async (req, res) => {
    if (!req.body.room_id || req.body.room_id === '') { res.json({ message: "room id not provied", status: false }) } else {
        try {
            const data = await Chat.find({ roomId: req.body.room_id }).select("messages")
            if (data.length > 0) {
                // const {_id,...chats} = data[0].messages
                const chat = data[0].messages
                res.status(200).json({ messages: chat, message: "Success", status: true })
            } else {
                res.status(200).json({ message: "No chats available", status: false })
            }
        } catch (err) {
            res.status(200).json({ message: "Something went wrong", ERROR: err.message, status: false })
        }
    }
}