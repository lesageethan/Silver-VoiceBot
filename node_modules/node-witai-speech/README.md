# node-witai-speech
Wit.ai speech API wrapper to extract the meaning of audio file 

## Install

> npm install node-witai-speech [--save]


## Usage

`````javascript

var WitSpeech = require('node-witai-speech');

// Stream the file to be sent to the wit.ai
var stream = fs.createReadStream("location to your audio file.");

// The wit.ai instance api key
var API_KEY = "ISDFWERSDFSDFSDFSDFSDFJIKM";

// The content-type for this audio stream (audio/wav, ...)
var content_type = "audio/wav";

// Its best to return a promise
var parseSpeech =  new Promise((ressolve, reject) => {
    // call the wit.ai api with the created stream
    WitSpeech.extractSpeechIntent(API_KEY, stream, content_type, 
    (err, res) => {
        if (err) return reject(err);
        ressolve(res);
    });
});

// check in the promise for the completion of call to witai
parseSpeech.then((data) => {
    console.log(data);
})
.catch((err) => {
    console.log(err);
})

`````