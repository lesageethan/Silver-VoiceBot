# Silver-VoiceBot

A voice-controlled Discord Bot, based off of code from XianHaiC.

To test the bot, use the test discord server: https://discord.gg/QCR2nkb

## Improvements

This project was created to revive XianHaiC's 'VoiceBot' from 2017. I have not only fixed his original VoiceBot, but I have/intent to improve it in a number of ways:

 - [x] I have added a prefix for voice commands: "Silver, play Arctic Monkeys"
 - [x] Simplified the playing system, removing the queue. This makes it more voice-interaction friendly
 - [x] Removed the imagebot functionality, as this was broken (I think)
 - [x] Changed the prefix from '!' to '//' to avoid clashing with other Discord bots
 - [x] Added a beep when the bot listens, so users are alerted
 - [x] Recordings are now deleted as they are used, so creepy recordings are not stored anywhere
 - [x] The correct node modules are included with the repo now, as they need to be installed in a specific order or they will not work
 
 - [ ] Stop random crashing
 - [ ] Improve voice recognition
 - [ ] Add information to 'help' command
 - [ ] Add voice
 - [ ] Make public
 - [ ] Add other functions
 - [ ] Add queue

 ## Setup
 
 To set up the bot, you will need to first get an API key for each of the required APIs (found in 'settings.json'). You then just need to run the index.js file.
 
 The modules which are in the repo should not be tampered with, as they have to be installed in a specific order to work.
 
 ## Usage
 
 Use '//help' command to see a list of all the commands.
 
 Use '//listen' to get Silver to listen to the channel you are in. use '//leave' to get the bot to leave. 
 
 Voice commands should be said like so: "Silver, play <song name>". The commands are recognized best when a ~1 second pause between "Silver" and your command.
 
 ## Maintenence
 
 I want to keep this repo fresh and regularly updated. If you find any bugs please message me on my twitter: https://twitter.com/RealEthanLS, or email me: lesageethan@gmail.com.
 
 If you can think of improvements, or if you want to add some improvements, please make a pull request. I would be more than happy to let you improve the code.
 
 Sorry if the code is messy, this is my first ever NodeJS project!
 
 ## Changelog
 
 For the sake of transparency, here is a list of all versions and updates:
 
 | Version Number  | Contributor | Changes |
| ------------- | ------------- | ------------- |
| v1.0.0  | EthanLS  | Initial Contribution |
