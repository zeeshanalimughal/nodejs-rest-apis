require("dotenv").config();
const db = require("./config/database");
db.connect();
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const express = require('express');
const app = express();
const cors = require('cors')
const router = express.Router();
const routes = require('./routes/routes')
const path = require('path');




app.use(cors())
app.options('*', cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(router);




// server = require('http').Server(app),
//     io = require('socket.io')(server, {
//         cors: {
//             origin: ["http://127.0.0.1:5500"]
//         }
//     });



app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

const port = process.env.PORT || 3000;


const server = require("http").createServer(app);
const io = require('socket.io')(server)
const socketManage = require('./socketManage')(io)

io.on('connection', socketManage)

// server.listen(6868, () => console.log("server running on port:" + 6868));



app.use('/api/', routes);

server.listen(port, () => {
    console.log('listening on port ' + port);
})