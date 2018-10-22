const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {createMessage, generateLocationMessage} = require('./utils/message');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', function (socket) {
   console.log('new user connect');

   socket.on('disconnect', function () {
       console.log('user was disconnected');
   });

   socket.emit('newMessage', {
       from: 'Admin',
       text: 'welcome to the chat app'
   })

    socket.broadcast.emit('newMessage', {
        from: 'broadcast',
        text: 'new user join'
    })

   socket.on('createMessage', function (message, callback) {
        console.log('creatre message', message);

        io.emit('newMessage', {
            from: message.from,
            text: message.text
        });

        callback(message);
   });

   socket.on('createLocationMessage', function (position) {
       io.emit('newLocationMessage', generateLocationMessage('Admin', position.lat, position.long));
   });
});

server.listen(port, function () {
   console.log('server is up');
});
