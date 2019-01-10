//Program: Discord Bot
//Author: Justin Ong
//Version: 1.1

const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const client = new Discord.Client();

//login using token defined in config.json
client.login(config.token).then(loginSuccess, loginFailure);

client.on('ready', () => {
	client.user.setActivity(config.prefix + "help");
});

//Emojis and help commands
client.on('message', msg => {
	if (msg.content[0] != (config.prefix) || msg.author.bot) {	//check for prefix and ID of caller
		return;
	}
	cmd = msg.content.slice(1);	//remove prefix
	//msg.reply(cmd);
	firstFourChar = cmd.substring(0, 4);
	//msg.reply(firstFourChar);
	//test = cmd.split(' ');
	//msg.reply(test);
	
	//Dice roller
	//Currently only supports rolls in the formal XdY + Z
	//TODO: Output sum for single dice roll when rollFlavours
	//TODO: Better reading of input to support lack of spaces and other formatting
	if (firstFourChar === 'roll') {
		//msg.reply("why");
		mainRoll = cmd.split(' ');
		//msg.reply(mainRoll);
		rollFlavour = mainRoll.slice(2).join(' ');
		
		/*
		if (!rollFlavour) {
			msg.reply("No rollFlavour");
		} else {
			msg.reply(rollFlavour);
		}
		*/
		
		sides = mainRoll[1];
		rolls = 1;
		
		if (!isNaN(mainRoll[1][0] / 1) && mainRoll[1].includes('d')) {	//rolls XdY
			rolls = mainRoll[1].split('d')[0] / 1;
			sides = mainRoll[1].split('d')[1];
		} else if (mainRoll[1][0] == 'd') {		//e.g. d20
			sides = sides.slice(1);
		}
		sidesLength = sides.length;
		sides = sides / 1; //convert to number
		if (isNaN(sides) || isNaN(rolls) || sides == 0 || rolls == 0) {
			msg.reply("Invalid Input!");
			return;
		}
		if (rolls > 1) {
			rollResults = [];		//store rolls in an array
			for (let i = 0; i < rolls; i++) {
				rollResults.push(Math.floor(Math.random()*sides)+1);
			}
			sum = rollResults.reduce((a,b) => a + b);		//store total sum
			temp = '' + sum;
			sumLength = temp.length;
			if ((20 + sumLength + (sidesLength + 1) * rollResults.length) > 2000) {		//stay within 2000 character limit
				return msg.reply('Too many dice to display, Total Sum is: ' + `[${sum.toString()}]`);
			}
			return msg.reply(`[${rollResults.toString()}] ${rollFlavour}` + ', Total Sum is: ' + `[${sum.toString()}]`);
		}
		else {
			roll = (Math.floor(Math.random() * sides) + 1);
			return msg.reply(roll + ' ' + rollFlavour);
		}
	}
	
	//Music player
	//TODO: Allow bot to read links as input and play from the link
	else if (cmd === 'play') {
		if (msg.member.voiceChannel) {
			msg.member.voiceChannel.join()
				.then(connection => { // Connection is an instance of VoiceConnection
					msg.reply('I have successfully connected to the channel!');
				})
				.catch(console.log);
		} else {
			msg.reply('You need to join a voice channel first!');
		}
	}
	
	//Other commands, emoji, pingpong, debugging
	//TODO: Refactor code to be more readable
	else {		
		switch(cmd) {
			case "help":
				msg.reply("The following commands are valid: roll, ping, pong, sleepysparks, sparksshine, rindouyay, jesus, thisisfine, butwhy, diabetes, 2meirl4meirl, thinking, pingtest, logout");
				break;
			case "ping":
				msg.reply("pong!");
				break;
			case "pong":
				msg.reply("ping!");
				break;
			case "sleepysparks":
				try {
					msg.channel.send("", {
						"files": ["./Emojis/SleepySparks.gif"]
					});
				}
				catch (e) {
					console.error(e);
				}
				break;
			case "sparksshine":
				try {
					msg.channel.send("", {
						"files": ["./Emojis/SparksShine.gif"]
					});
				}
				catch (e) {
					console.error(e);
				}
				break;
			case "rindouyay":
				try {
					msg.channel.send("", {
						"files": ["./Emojis/RindouYay.gif"]
					});
				}
				catch (e) {
					console.error(e);
				}
				break;
			case "jesus":
				try {
					msg.channel.send("", {
						"files": ["./Emojis/JCKid.gif"]
					});
				}
				catch (e) {
					console.error(e);
				}
				break;
			case "thisisfine":
				try {
					msg.channel.send("", {
						"files": ["./Emojis/ThisIsFine.gif"]
					});
				}
				catch (e) {
					console.error(e);
				}
				break;
			case "butwhy":
				try {
					msg.channel.send("", {
						"files": ["./Emojis/ButWhy.gif"]
					});
				}
				catch (e) {
					console.error(e);
				}
				break;
			case "diabetes":
				try {
					msg.channel.send("", {
						"files": ["./Emojis/Diabetes.gif"]
					});
				}
				catch (e) {
					console.error(e);
				}
				break;
			case "2meirl4meirl":
				try {
					msg.channel.send("", {
						"files": ["./Emojis/2meirl4meirl.gif"]
					});
				}
				catch (e) {
					console.error(e);
				}
				break;
			case "thinking":
				try {
					msg.channel.send("", {
						"files": ["./Emojis/ThinkingEmoji.gif"]
					});
				}
				catch (e) {
					console.error(e);
				}
				break;
			case "pingtest":
				msg.channel.send("Pinging...").then(sent => {
					sent.edit("Took " + `${sent.createdTimestamp - msg.createdTimestamp}` + " ms");
				});
				break;
			case "logout":
				console.log("Logged out!");
				client.destroy();
				break;
			default:
				msg.reply("No such command!");
		}
	}
});

function loginSuccess(result) {
  console.log("Logged in as " + client.user.username + "!");
}

function loginFailure(error) {
  console.log("Failed to log in! Close this window and try again.");
}