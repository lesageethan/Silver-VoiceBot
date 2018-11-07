const reqevent = (event) => require(`../events/${event}.js`);

module.exports = client => {
    client.on('ready', () => {
        reqevent('ready').run(client);
    });
    client.on('message', message => {
        reqevent('message').run(message);
    });
    client.on('guildMemberSpeaking', (member, speaking) => {
        reqevent('guildMemberSpeaking').run(member, speaking);
    });
};