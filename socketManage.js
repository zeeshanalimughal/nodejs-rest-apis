const Chat = require('./model/chat')

module.exports = io => socket => {
    console.log("Made socket connection", socket.id,);

    socket.on('new-user', id => {
        // users[socket.id] = name
        socket.broadcast.emit('user-connected', " user added")
      })

    socket.on("chatmessage", async msg => {
        console.log(msg);
        io.emit("chat message", msg);

        try {
            const { room, from, text } = msg;
            let checkRoomExists = await Chat.findOne({ roomId: room });
            if (checkRoomExists) {
                await Chat.updateOne({ roomId: room },
                    {
                        roomId: room,
                        $push: {
                            messages: {
                                senderId: from,
                                message: text
                            }
                        }
                    },
                    function (error, success) {
                        if (error) {
                            socket.emit("error", error.message);
                        }
                    }).then(() => {

                    }).catch(error => {
                        socket.emit("error", error.message);
                    })
            } else {
                let chat = await new Chat({
                    roomId: room,
                    messages: {
                        senderId: from,
                        message: text
                    }
                });
                await chat.save().then(() => {

                }).catch(err => {
                    socket.emit("error", err.message);
                })
            }

        } catch (err) {
            socket.emit("error", err.message);
        }

    });
    io.on("disconnect", () => {
        socket.emit("user-disconnected","User Disconnected");
    });
}