const { Client } = require('discord.js');
const fs = require('fs');
const config = require('./settings.json'); // get settings, Use require instead of fs because file is read only


class Silver extends Client {

    /**
     * What i'm doing here:
     * Instead of using global variables i am extending the base client
     * This means that these variables will be accessible when using the client object
     */
    constructor() {
        super();
        this.isPlaying = false; // music vars
        this.dispatcher = null;
        this.voiceChannel = null;
        this.textChannel = null;
        this.listenConnection = null;
        this.listenReceiver = null;
        this.listening = false;
        this.listenChannel = '';
        this.listenStreams = new Map();
        this.repeat = false;

    }
    // This is the reload function, so we don't have to reboot the bot everytime we update.
    reload(author) {
        let files;
        let types = ['commands', 'modules', 'events'];
        for (let t of types) {
            if (fs.existsSync(`${__dirname}/${t}`)) {
                files = fs.readdirSync(`${__dirname}/${t}`);
                for (let k of files) {
                    delete require.cache[require.resolve(`${__dirname}/${t}/${k}`)];
                }
            }
        }
        if (author) author.send(`Reloaded all modules.`).catch(() => { });
        console.log('Reloaded all Modules');
    }
} // Create Client
const discord_token = config.discord_token;


const client = new Silver({
    disableEveryone: true, // Always do this
    disabledEvents: ['GUILD_EMOJIS_UPDATE', 'TYPING_START', 'TYPING_STOP', 'CHANNEL_PINS_UPDATE', 'EMOJICREATE', 'EMOJIDELETE', 'EMOJIUPDATE', 'USER_NOTE_UPDATE'], // Some useless events to disable to help reduce lag.
});

const init = () => {
    client.login(discord_token);
    require('./modules/eventloader')(client);
};

init();
// Super useful events listen on, also logging errors, disconnects and reconnects is a must
client.on('disconnect', () => console.log('Bot is disconnected...'))
    .on('reconnect', () => console.log('Bot reconnecting...'))
    .on('error', e => console.log(e))
    .on('warn', info => console.log(info));

client.login(discord_token).catch(err => console.log(err.stack)); // There are times when the bot will not login, catch this to avoid crashes.