exports.run = client => {
    console.log('I\'m ready!');
    client.user.setActivity('Commands', { type: 'LISTENING' }); // set client status
};