# Silver-VoiceBot

A voice-controlled Discord Bot, based off of code from XianHaiC.

To test the bot, use the test discord server: https://discord.gg/QCR2nkb

## About

This project was created to revive XianHaiC's 'VoiceBot' from 2017. I have not only fixed his original VoiceBot, but I have improved it in a number of ways:

 - I have added a prefix for voice commands: "Silver, play Arctic Monkeys"
 
 - I have simplified the playing system, removing the queue. This makes it more voice-interaction friendly
 
 - I have removed the imagebot functionality, as this was broken (I think)
 
 - I have changed the prefix from '!' to '//' to avoid clashing with other Discord bots
 
 - I have added a beep when the bot listens, so users are alerted
 
 - Recordings are now deleted as they are used, so creepy recordings are not stored anywhere
 
 - The correct node modules are included with the repo now, as they need to be installed in a specific order or they will not work
 
 ## Setup
 
 To set up the bot, you will need to first get an API key for each of the required APIs (found in 'settings.json'). You then just need to run the index.js file.
 
 The modules which are in the repo should not be tampered with, as they have to be installed in a specific order to work.
 
 ## Usage
 
 Use '//help' command to see a list of all the commands.
 
 Use '//listen' to get Silver to listen to the channel you are in. use '//leave' to get the bot to leave. 
 
 Voice commands should be said like so: "Silver, play <song name>". The commands are recognized best when a ~1 second pause between "Silver" and your command.
 
 ## Maintenence
 
 I want to keep this repo fresh and regularly updated. If you find any bugs please message me on my twitter: https://twitter.com/RealEthanLS, or email me: lesageethan@gmail.com.
 
 If you can think of improvements, or if you want to add some improvements, please make a push request. I would be more than happy to let you improve the code.
 
 Sorry if the code is messy, this is my first ever NodeJS project!
 
 ## Changelog
 
 For the sake of transparency, here is a list of all versions and updates:
 
 | Version Number  | Contributor | Changes |
| ------------- | ------------- | ------------- |
| v1.0.0  | EthanLS  | Initial Contribution |
