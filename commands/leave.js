exports.run = (message) => {
    console.log('leaving');
    message.client.listening = false;
    message.client.queue = [];
    if (message.client.dispatcher) message.client.dispatcher.end();
    message.client.dispatcher = null;
    if (message.client.listenReceiver) {
        message.client.listening = false;
        message.client.listenReceiver.destroy();
        message.client.listenReceiver = null;
        message.client.textChannel.send('Stopped listening!');
    }
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
