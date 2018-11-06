const prefix = require('../settings.json').prefix;
const fs = require('fs');

// handling message commands

exports.run = (message) => {
    if (!message.content.startsWith(prefix)) return;
    // interpereting text commands and cleaning data

    // Using args and then shifting reduces operations, and improves readability
    let args = message.content.replace(prefix, '').split(/ /g);
    let command = args.shift();
    console.log(args);
    switch (command) { // choosing function according to command
        case 'play':
        case 'skip':
        case 'next':
            break;
    }
    if (fs.existssync(`../commands/${command}.js`)) require(`../commands/${command}.js`).run(message);
    else message.channel.send('Command not recognized! Type \'!help\' for a list of commands.');
};