/* eslint "newline-per-chained-call" : "off" */

const decode = require('../modules/decodeOpus.js');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const WitSpeech = require('node-witai-speech');
const WIT_API_KEY = require('../settings.json').wit_api_key; // declaring api constants
const content_type = require('../settings.json').content_type;

function processRawToWav(filepath, outputpath) {
    return new Promise((resolve, reject) => {
        fs.closeSync(fs.openSync(outputpath, 'w'));
        ffmpeg(filepath).addInputOptions([
            '-f s32le',
            '-ar 48k',
            '-ac 1',
        ]).on('end', () => {
            // Stream the file to be sent to the wit.ai
            let stream = fs.createReadStream(outputpath);

            // Its best to return a promise

            // call the wit.ai api with the created stream
            let parseSpeech = new Promise((resol, rej) => {
                WitSpeech.extractSpeechIntent(WIT_API_KEY, stream, content_type, (err, res) => {
                    if (err) return rej(err);
                    resol(res);
                });
            });

            // check in the promise for the completion of call to witai
            parseSpeech.then((data) => {
                console.log('you said: ' + data._text);
                // return data;
                resolve(data);
                fs.unlinkSync(filepath);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        }).on('error', (err) => {
            console.log('an error happened: ' + err.message);
            reject(err);
        }).addOutput(outputpath).run();
    });
}

function handleSpeech(member, speech, basename) { // handling voice commands
    fs.unlinkSync(`./recordings/${basename}.wav`);
    let args = speech.split(/ /g);
    let command = args.shift().toLowerCase();
    if ((command == 'silver' || command == 'silva') && args[0]) { // making sure voice commands start with silver
        command = args.shift().toLowerCase();
        console.log('command recognized: ' + command);
        switch (command) { // choosing function according to voice data
            case 'play':
            case 'hehe':
            case 'apply':
                command = 'play';
                break;
            case 'skip':
            case 'skip track':
            case 'next':
            case 'keep':
            case 'ip':
            case 'it':
                command = 'skip';
                break;
        }
        if (fs.existsSync(`./commands/${command}.js`)) require(`../commands/${command}.js`).run(member, args);
        else return member.client.listenChannel.send('Command not recognized: **' + speech + '**');
    }
}

// turn audio into text
exports.run = (member, speaking) => {
    // Close the writeStream when a member stops speaking
    if (!speaking && member.voiceChannel) {
        let stream = member.client.listenStreams.get(member.id);
        if (stream) {
            member.client.listenStreams.delete(member.id);
            stream.end(err => {
                if (err) console.error(err);
                let basename = stream.path.replace(/\/.*\//g, '').replace('.', '').replace('.opus_string', '');
                // decode file into pcm
                console.log(basename);
                decode.convertOpusStringToRawPCM(stream.path, basename).then(() => {
                    // convert raw audio to wav
                    processRawToWav(`./recordings/${basename}.raw_pcm`, `./recordings/${basename}.wav`).then(data => {
                        if (data != null) handleSpeech(member, data._text, basename);
                    }).catch(error => console.log(error.stack));
                }).catch(error => console.log(error.stack));
                fs.unlinkSync(`./recordings/${basename}.opus_string`); // delete file after it has been used
                // use fs unlinksync, use single string instead of variable, string literals save space
            });
        }
    }
};