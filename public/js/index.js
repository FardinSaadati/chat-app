var socket = io();

function scrollToBottom() {
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child');

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function () {
    console.log('connected to server');
});

socket.on('disconnect', function () {
    console.log('disconnected from server');
});

socket.on('newMessage', function (message) {

    var template = $('#message-template').html();

    var html = Mustache.render(template, {
        from: message.from,
        text: message.text,
        createAt: moment(message.createAt).format('h:mm a')
    });

    $('#messages').append(html);
    scrollToBottom();
    /*var formatedTime = moment(message.createAt).format('h:mm a');
     var li = $('<li></li>');
     li.text(`${message.from} ${formatedTime}: ${message.text}`);
     $('#message').append(li);*/
});

socket.on('newLocationMessage', function (location) {

    var template = $('#location-template').html();

    var html = Mustache.render(template, {
        from: location.from,
        text: location.text,
        url: location.url,
        createAt: moment(location.createAt).format('h:mm a')
    });

    $('#messages').append(html);
    scrollToBottom();
    /*var formatedTime = moment(message.createAt).format('h:mm a');
    var li = $('<li></li>');
    var a = $('<a target="_blank">my current location</a>');
    li.text(`${location.from} ${formatedTime}: `);
    a.attr('href', location.url);
    li.append(a);
    $('#message').append(li);*/
});

$('#message-form').on('submit', function (e) {
    e.preventDefault();

    var messageTextBox = $('[name=message]');
    socket.emit('createMessage', {
        from: 'User',
        text: messageTextBox.val()
    }, function (data) {
        messageTextBox.val('');
    });
});

var locationBtn = $('#send-location');

locationBtn.on('click', function () {
    if (!navigator.geolocation) {
        return alert('geolocation not supported by your browser');
    }

    locationBtn.attr('disabled', 'disabled').text('Sending Location...');

    navigator.geolocation.getCurrentPosition(function (position) {
        locationBtn.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        });
    }, function () {
        locationBtn.removeAttr('disabled');
        alert('unable to fetch location');
    });
});
