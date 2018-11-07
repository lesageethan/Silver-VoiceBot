exports.run = function (message) {
    message.client.reload(message.author);
};