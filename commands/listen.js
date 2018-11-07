const fs = require('fs');

exports.run = (message) => {
    message.client.listenChannel = message.channel;
    message.client.textChannel = message.channel;
    // This is the proper way to check for bot.
    if (message.member.user.bot) return; // checks if bot or human
    if (!message.member.voiceChannel) return message.reply(' you need to be in a voice channel first.'); // check if user is in a voice channel

    if (message.client.listening) return message.reply(' a voice channel is already being listened to!'); // check if voice channel is already being listened to (durr)
    // else:
    message.client.listening = true; // log that the bot is listening currently
    message.client.voiceChannel = message.member.voiceChannel;
    message.client.textChannel.send('Listening in to **' + message.member.voiceChannel.name + '**!'); // respond

    message.client.voiceChannel.join().then(connection => {
        message.client.listenConnection = connection;

        let receiver = connection.createReceiver();
        receiver.on('opus', (user, data) => { // start recieving voice data
            let hexString = data.toString('hex');
            let stream = message.client.listenStreams.get(user.id);
            if (!stream) {
                if (hexString === 'f8fffe') {
                    return;
                }
                let outputPath = `./recordings/${Date.now()}.opus_string`; // record audio
                stream = fs.createWriteStream(outputPath);
                message.client.listenStreams.set(user.id, stream);
            }
            stream.write(`,${hexString}`);
        });
        message.client.listenReceiver = receiver;
    }).catch(err => console.log(err.stack)); // catch errors
    require('./play.js').run(message, ['https://www.youtube.com/watch?v=msZIL66yUq8', 'speechText']);
};