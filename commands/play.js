const request = require('superagent');
const yt_api_key = require('../settings.json').yt_api_key;
const ytdl = require('ytdl-core');

function play(id, client) {
    client.isPlaying = true;
    client.voiceChannel.join().then(connection => {
        // set stream from appropriate youtube video
        client.YTstreamT = ytdl('https://youtube.com/watch?v=' + id, {
            filter: 'audioonly',
        });

        try {
            console.log('attempt playing');
            client.dispatcher = connection.playStream(client.YTstreamT); // play the previously defined stream
            console.log('playing');
        } catch (err) {
            console.log(err.message);
        }

        client.dispatcher.on('end', () => {
            client.isPlaying = false;
            client.dispatcher = null;
            console.log('stopped playing');
        }); // change variables when audio is finished
    });

}

exports.run = async (message, args) => {
    let query;
    let after;
    if (args[0].startsWith('https://www.youtube.com/watch?v=') || args[0].startsWith('https://m.youtube.com/watch?v=')) {
        if (args[0].startsWith('https://www.youtube.com/watch?v=')) after = args[0].replace('https://www.youtube.com/watch?v=', '');
        else if (args[0].startsWith('https://m.youtube.com/watch?v=')) after = args[0].replace('https://m.youtube.com/watch?v=', '');
        after.replace(/\\/g, '');
        query = after.slice(0, 11);
    } else query = args.join('+');
    try {
        let results = await request.get(`https://www.googleapis.com/youtube/v3/search?&q=${query}&key=${yt_api_key}&part=snippet&type=video`);
        let result = JSON.parse(results.text);
        if (!result.items || !result.items[0]) return message.channel.send('ERROR: No results found', 20);
        let vid = result.items[0];
        let times = await request.get(`https://www.googleapis.com/youtube/v3/videos?id=${vid.id.videoId}&key=${yt_api_key}&part=contentDetails&type=video`);
        let time = [];
        let minutes = 0;
        let timez = JSON.parse(times.text);
        message.channel.send('Playing: ** ' + vid.snippet.title + '**');
        let client = message.client;
        play(vid.id.videoId, client);
    } catch (err) {
        return message.channel.send('Something went wrong :(\n' + err);
    }
};