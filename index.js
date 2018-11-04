const Discord = require("discord.js"); 
const ytdl = require("ytdl-core"); 
const request = require("request"); 
const getYoutubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info"); 
const ffmpeg = require('fluent-ffmpeg'); 
const WitSpeech = require('node-witai-speech'); 
const decode = require('./decodeOpus.js'); 
const fs = require('fs'); 
const path = require('path'); 
const opus = require('node-opus'); 

var config = JSON.parse(fs.readFileSync("./settings.json", "utf-8")); //get settings

const WIT_API_KEY = config.wit_api_key; //declaring api constants
const yt_api_key = config.yt_api_key;
const bot_controller = config.bot_controller;
const prefix = config.prefix;
const discord_token = config.discord_token;
const content_type = config.content_type;

const client = new Discord.Client(); //discord bot setup
const recordingsPath = makeDir('./recordings');

var isPlaying = false; //music vars
var dispatcher = null;
var voiceChannel = null;
var textChannel = null;
var listenConnection = null;
var listenReceiver = null;
var listenStreams = new Map();
var listening = false;
var listenChannel = "";


client.login(discord_token);
client.on('ready', handleReady.bind(this));
client.on('message', handleMessage.bind(this));
client.on('guildMemberSpeaking', handleSpeaking.bind(this)); //event management

function handleReady() {
  console.log("I'm ready!");
  client.user.setActivity('Commands', { type: 'LISTENING' }); //set bot status
}

function handleMessage(message) { //handling message commands
  if (!message.content.startsWith(prefix)) {
    return;
  }
  //interpereting text commands and cleaning data
  var command = message.content.toLowerCase().slice(2).split(' '); //convert message to list of lowercase words
  command = command[0];
  
  var messageParams = message.content
  messageParams = messageParams.substring(5)

  console.log(messageParams)

  switch (command) { //choosing function according to command
    case 'help':
      message.channel.send('\n**Commands:** \n - //leave: leave channel and stop listening \n - //help: list of commands \n - //play: play song from youtube \n - //skip: skip song \n - //listen: join channel to listen to voice commands\n\n **Voice Commands:** \n - "Silver, play": play song from youtube \n - "Silver, skip": skip song\n - "Silver, leave": leave channel and stop listening');
    break;
    case 'leave':
      commandLeave();
    break;
    case 'play':
      isPlaying = true;
      getID(messageParams, function(id) {
        commandPlay(id, message.member);
        fetchVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err);
          if (id != "Vbks4abvLEw") {
            message.channel.send("Playing: **" + videoInfo.title + "**");
          } else {
            message.channel.send("**No Video Found**");
          }
        });
      });
    break;
    case 'skip':
    case 'next':
      commandSkip(message);
    break;
    case 'listen':
      listenChannel = message.channel;
      textChannel = message.channel;
      commandListen(message);
    break;
    default:
      message.channel.send("Command not recognized! Type '!help' for a list of commands.");
  }
}

function handleSpeech(member, speech) { //handling voice commands
  var command = speech.toLowerCase().split(' ');
  if (command[0] == 'Silver' || command[0] == 'Silva' || command[0] == 'silver' || command[0] == 'silva') { //making sure voice commands start with silver
    console.log("command recognized");
    
    command = command[1];
    var messageParams = speech
    messageParams = messageParams.substring(10)

    console.log(messageParams)

    switch (command) { //choosing function according to voice data
      case 'listen':
        speechListen();
      break;
      case 'leave':
        commandLeave();
      break;
      case 'play':
      case 'hehe':
      case 'apply':
        isPlaying = true;
        getID(messageParams, function(id) {
          commandPlay(id, 'speechText');
          fetchVideoInfo(id, function (err, videoInfo) {
            if (err) throw new Error(err);
              if (id != "Vbks4abvLEw") {
                listenChannel.send(" Playing: **" + videoInfo.title + "**");
              } else {
                listenChannel.send("**No Video Found**");
              }
            });
        });
      break;
      case 'skip':
      case 'skip track':
      case 'next':
      case 'keep':
      case 'ip':
      case 'it':
        commandSkip('speechText');
      break;
      default:
        listenChannel.send("Command not recognized: **" + speech + "**");
      break;
    }
  }
}

function handleSpeaking(member, speaking) { //turn audio into text
  // Close the writeStream when a member stops speaking
  if (!speaking && member.voiceChannel) {
    let stream = listenStreams.get(member.id);
    if (stream) {
      listenStreams.delete(member.id);
      stream.end(err => {
        if (err) {
          console.error(err);
        }

        let basename = path.basename(stream.path, '.opus_string');
        let text = "default";

        // decode file into pcm
        decode.convertOpusStringToRawPCM(stream.path,
          basename,
          (function() {
            processRawToWav( //convert raw audio to wav
              path.join('./recordings', basename + '.raw_pcm'),
              path.join('./recordings', basename + '.wav'),
              (function(data) {
                if (data != null) {
                  handleSpeech(member, data._text);
                }
              }).bind(this))
          }).bind(this));

        var totalName = './recordings/'+ basename + '.opus_string';
        deleteFile(totalName); //delete file after it has been used
      });
    }
  }
}

function commandSkip(message) {
  if (message == "speechText") { //check if skip command was issued by voice or message
    if (isPlaying == true) {
      listenChannel.send("**Skipping!**"); //respond in text
      dispatcher.end(); //end song
    } else {
      listenChannel.send("**Skip failed** - nothing is playing!");
    }
  } else {
    if (isPlaying == true) {
      message.channel.send("**Skipping!**");
      dispatcher.end();
    } else {
      message.channel.send("**Skip failed** - nothing is playing!");
    }
  }
}

function commandPlay(id, member) {
  if (member != 'speechText') { //check if command was issued via voice
    voiceChannel = member.voiceChannel;
  }

  isPlaying = true;
  voiceChannel.join().then(function (connection) {
    YTstreamT = ytdl("https://youtube.com/watch?v=" + id, { //set stream from appropriate youtube video
      filter: 'audioonly'
    });

    try {
      console.log("attempt playing");
      dispatcher = connection.playStream(YTstreamT); //play the previously defined stream
      console.log("playing");
    } catch (err) {
      console.log(err.message);
    }
    
    dispatcher.on('end', function () {
      isPlaying = false;
      dispatcher = null;
      console.log("stopped playing")
    }); //change variables when audio is finished
  });
}

function getID(str, cb) { //find id of youtube video to be played
  if (isYoutube(str)) {
    cb(getYoutubeID(str));
  } else {
    search_video(str, function(id) {
      cb(id);
      console.log(id);
    });
  }
}

function search_video(query, callback) { //search for youtube video according to search terms
  request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function(error, response, body) {
    var json = JSON.parse(body);
    try {
      callback(json.items[0].id.videoId);
    } catch(err) {
      callback("Vbks4abvLEw");
    }
  });
}

function isYoutube(str) { //check if play command is a url or a search query
  return str.toLowerCase().indexOf('youtube.com') > -1;
}

function commandListen(message) {
  member = message.member;
  if (!member) {
    return; //checks if bot or human
  }
  if (!member.voiceChannel) {
    message.reply(" you need to be in a voice channel first.") //check if user is in a voice channel
    return;
  }
  if (listening) {
    message.reply(" a voice channel is already being listened to!"); //check if voice channel is already being listened to (durr)
    return;
  }
  //else:
  listening = true; //log that the bot is listening currently
  voiceChannel = member.voiceChannel;
  textChannel.send('Listening in to **' + member.voiceChannel.name + '**!'); //respond

  var recordingsPath = path.join('.', 'recordings');
  makeDir(recordingsPath);

  voiceChannel.join().then((connection) => {
    listenConnection = connection;

    let receiver = connection.createReceiver();
    receiver.on('opus', function(user, data) { //start recieving voice data
      let hexString = data.toString('hex');
      let stream = listenStreams.get(user.id);
      if (!stream) {
        if (hexString === 'f8fffe') {
          return;
        }
        let outputPath = path.join(recordingsPath, `${user.id}-${Date.now()}.opus_string`); //record audio
        stream = fs.createWriteStream(outputPath);
        listenStreams.set(user.id, stream);
      }
      stream.write(`,${hexString}`);
    });
    listenReceiver = receiver;
  }).catch(console.error); //catch errors
  commandPlay('6485oNnwum8','speechText');
}

function commandLeave() {
  console.log('leaving');
  listening = false;
  queue = []
  if (dispatcher) {
    dispatcher.end();
  }
  dispatcher = null;
  commandStop();
  if (listenReceiver) {
    listenReceiver.destroy();
    listenReceiver = null;
  }
  if (listenConnection) {
    listenConnection.disconnect();
    listenConnection = null;
  }
  if (voiceChannel) {
    voiceChannel.leave();
    voiceChannel = null; //leave channel (simple)
  }
}

function processRawToWav(filepath, outputpath, cb) {
  fs.closeSync(fs.openSync(outputpath, 'w'));
  var command = ffmpeg(filepath)
  .addInputOptions([
    '-f s32le',
    '-ar 48k',
    '-ac 1'
    ])
  .on('end', function() {
      // Stream the file to be sent to the wit.ai
      var stream = fs.createReadStream(outputpath);

      // Its best to return a promise
      var parseSpeech =  new Promise((ressolve, reject) => {
      // call the wit.ai api with the created stream
      WitSpeech.extractSpeechIntent(WIT_API_KEY, stream, content_type,
        (err, res) => {
          if (err) return reject(err);
          ressolve(res);
        });
    });

      // check in the promise for the completion of call to witai
      parseSpeech.then((data) => {
        console.log("you said: " + data._text);
        cb(data);
        //return data;
      })
      .catch((err) => {
        console.log(err);
        cb(null);
        //return null;
      }).then(deleteFile(filepath));
    })
  .on('error', function(err) {
    console.log('an error happened: ' + err.message);
  })
  .addOutput(outputpath)
  .run();
}

function deleteFile(dir) {
  fs.unlink(dir, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

function makeDir(dir) {
  try {
    fs.mkdirSync(dir);
  } catch (err) {}
}

function commandStop() {
  if (listenReceiver) {
    listening = false;
    listenReceiver.destroy();
    listenReceiver = null;
    textChannel.send("Stopped listening!");
  }
}