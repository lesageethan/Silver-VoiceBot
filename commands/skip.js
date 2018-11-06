exports.run = (message) => {
    if (message == 'speechText') { // check if skip command was issued by voice or message
        if (message.client.isPlaying) {
            message.client.listenChannel.send('**Skipping!**'); // respond in text
            message.client.dispatcher.end(); // end song
        } else message.client.listenChannel.send('**Skip failed** - nothing is playing!');
    } else if (message.client.isPlaying) {
        message.channel.send('**Skipping!**');
        message.client.dispatcher.end();
    } else message.channel.send('**Skip failed** - nothing is playing!');
};