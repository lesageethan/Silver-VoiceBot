/* eslint "newline-per-chained-call" : "off" */

const decode = require('../decodeOpus.js');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const WitSpeech = require('node-witai-speech');
const WIT_API_KEY = require('../settings.js').wit_api_key; // declaring api constants
const content_type = require('../settings.js').content_type;

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
                resolve(data);
                // return data;
            }).catch((err) => {
                console.log(err);
                reject(err);
            }).then(() => fs.unlinkSync(filepath));
        }).on('error', (err) => {
            console.log('an error happened: ' + err.message);
            reject(err);
        }).addOutput(outputpath)
            .run();
    });
}

function handleSpeech(member, speech) { // handling voice commands
    let args = speech.split(/ /g);
    let command = args.shift().toLowerCase();
    if (command == 'silver' || command == 'silva') { // making sure voice commands start with silver
        console.log('command recognized');
        command = args.shift().toLowerCase();
        var messageParams = speech;
        messageParams = messageParams.substring(10);
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
        console.log(messageParams);
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

                let basename = stream.path.replace(/\/.*\//g, '').replace('.opus_string', '');
                // decode file into pcm
                decode.convertOpusStringToRawPCM(stream.path, basename, () => {
                    // convert raw audio to wav
                    processRawToWav(`./recordings${basename}.raw_pcm`, `./recordings${basename}.wav`, ((data) => {
                        if (data != null) handleSpeech(member, data._text);
                    }).bind(this));
                }).bind(this);

                fs.unlinkSync(`./recordings/${basename}.opus_string`); // delete file after it has been used
                // use fs unlinksync, use single string instead of variable, string literals save space
            });
        }
    }
};