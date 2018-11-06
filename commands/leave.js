exports.run = (message) => {
    console.log('leaving');
    message.client.listening = false;
    message.client.queue = [];
    if (message.client.dispatcher) message.client.dispatcher.end();
    message.client.dispatcher = null;
    require('./stop.js').run(message);
    if (message.client.listenReceiver) {
        message.client.listenReceiver.destroy();
        message.client.listenReceiver = null;
    }
    if (message.client.listenConnection) {
        message.client.listenConnection.disconnect();
        message.client.listenConnection = null;
    }
    if (message.client.voiceChannel) {
        message.client.voiceChannel.leave();
        message.client.voiceChannel = null; // leave channel (simple)
    }
};
