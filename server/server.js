const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {createMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', function (socket) {
    console.log('new user connect', socket.id);

    socket.on('join', function (params, callback) {

        if (! isRealString(params.name) || ! isRealString(params.room)) {
            return callback('name and room is require');
        }

        var user = users.getUserByName(params.name);

        if (user) {
            return callback('name alredy exist');
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        socket.emit('newMessage', createMessage('Admin', 'welcome to the chat app'));
        socket.broadcast.to(params.room).emit('newMessage', createMessage('Admin', `${params.name} has joined`));

        callback();
    });

    socket.on('createMessage', function (message, callback) {
        var user = users.getUser(socket.id);

        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', createMessage(user.name, message.text));
        }

        callback();
    });

    socket.on('createLocationMessage', function (position) {
        var user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, position.lat, position.long));
        }
    });

    socket.on('disconnect', function () {
        var user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', createMessage('Admin', `${user.name} has left`));
        }
    });
});

server.listen(port, function () {
    console.log('server is up');
});
