const moment = require('moment');

var createMessage = function (from, text) {
    return {
        from,
        text,
        createAt: moment().valueOf()
    }
};

var generateLocationMessage = function (from, lat, long) {
    return {
        from,
        url: `https://www.google.com/maps?q=${lat}, ${long}`,
        createAt: moment().valueOf()
    };
};

module.exports = {
    createMessage,
    generateLocationMessage
};