const request = require('superagent');
const yt_api_key = require('../settings.json').yt_api_key;
const ytdl = require('ytdl-core');
const fs = require('fs');

function play(id, client) {
    client.isPlaying = true;
    client.voiceChannel.join().then(connection => {
        // set stream from appropriate youtube video
        client.YTstreamT = ytdl('https://youtube.com/watch?v=' + id, {
            filter: 'audioonly',
        });
        try {
            console.log('attempt playing');
            client.dispatcher = connection.playFile('./recordings/' + id + '.mp3', {
                passes: 10,
                volume: id == 'msZIL66yUq8' ? 0.05 : 1,
            });
            console.log('playing');
            client.dispatcher.on('error', error => {
                console.log(error);
            });
            client.dispatcher.on('end', () => {
                client.isPlaying = false;
                client.dispatcher = null;
                console.log('stopped playing');
            }); // change variables when audio is finished
        } catch (err) {
            console.log(err.message);
        }
    }).catch(err => console.log(err.stack));
}

function streamer(id, client) {
    let url = 'https://youtube.com/watch?v=' + id;
    let path = './recordings/' + id + '.mp3';
    if (!fs.existsSync(path) || (fs.statSync(path).size / 2000000) < 1) {
        if (fs.existsSync(url)) fs.unlinkSync(url);
        let stream = ytdl(url, {
            filter: 'audioonly',
            quality: [251, 250, 249, 171, 140, 139],
        });
        stream.on('error', (error) => {
            console.log('Error with stream ' + error.stack);
            client.textChannel.send('There was an error downloading the video ' + url + '\n' + error.stack);
        });
        let write = stream.pipe(fs.createWriteStream(path));
        write.on('finish', () => {
            try {
                play(id, client);
            } catch (err) {
                client.textChannel.send('Error processing the stream. Please stop the stream with the command and requeue it. Until further notice this is the only solution.').catch(() => { });
                return console.log(err.stack);
            }
        });
    } else {
        try {
            play(id, client);
        } catch (err) {
            client.textChannel.send('Error processing the stream. Please stop the stream with the command and requeue it. Until further notice this is the only solution.').catch(() => { });
            return console.log(err.stack);
        }
    }
}

exports.run = async (message, args) => {
    if (!message.client.textChannel) return;
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
        if (!result.items || !result.items[0]) return message.client.textChannel.send('ERROR: No results found');
        let vid = result.items[0];
        let times = await request.get(`https://www.googleapis.com/youtube/v3/videos?id=${vid.id.videoId}&key=${yt_api_key}&part=contentDetails&type=video`);
        let time = [];
        let minutes = 0;
        let timez = JSON.parse(times.text);
        if (args[1] != 'speechText') message.client.textChannel.send('Playing: ** ' + vid.snippet.title + '**');
        streamer(vid.id.videoId, message.client);
    } catch (err) {
        console.log(err.stack);
        return message.client.textChannel.send('Something went wrong :(\n' + err);
    }
};