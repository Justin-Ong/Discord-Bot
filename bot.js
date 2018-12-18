const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const client = new Discord.Client();

client.login(config.token).then(loginSuccess, loginFailure);

client.on('ready', () => {
	client.user.setActivity(config.prefix + "help");
});

//emojis and help
client.on("message", msg => {
	if (msg.content[0] != (config.prefix) || msg.author.bot) {
		return;
	}
	else {
		cmd = msg.content.slice(1);
		switch(cmd) {
			case "help":
				msg.channel.send("The following commands are valid: roll, ping, pong, sleepysparks, sparksshine, rindouyay, jesus, thisisfine, butwhy, diabetes, 2meirl4meirl, thinking, pingtest, logout");
				break;
			case "ping":
				msg.channel.send("pong!");
				break;
			case "pong":
				msg.channel.send("ping!");
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
		}
	}
});

//dice roller
client.on('message', (message) => {
	if (message.content[0] != (config.prefix) || message.author.bot) {
		return;
	}
	const messageWords = message.content.split(' ');
	message.channel.send(messageWords);
	const rollFlavour = messageWords.slice(2).join(' ');
	if (!rollFlavour) {
		message.channel.send("No rollFlavour");
	} else {
		message.channel.send(rollFlavour);
	}
	if (messageWords[0] === (config.prefix + 'roll')) {
		let sides = messageWords[1]; // !roll 20
		let rolls = 1;
		
		if (!isNaN(messageWords[1][0] / 1) && messageWords[1].includes('d')) {	//rolls XdY
			rolls = messageWords[1].split('d')[0] / 1;
			sides = messageWords[1].split('d')[1];
		} else if (messageWords[1][0] == 'd') {		//e.g. d20
			sides = sides.slice(1);
		}
		sidesLength = sides.length;
		sides = sides / 1; //convert to number
		if (isNaN(sides) || isNaN(rolls) || sides == 0 || rolls == 0) {
			message.channel.send("Invalid Input!");
			return;
		}
		if (rolls > 1) {
			const rollResults = [];		//store rolls in an array
			for (let i = 0; i < rolls; i++) {
				rollResults.push(Math.floor(Math.random()*sides)+1);
			}
			const sum = rollResults.reduce((a,b) => a + b);		//store total sum
			temp = '' + sum;
			sumLength = temp.length;
			if ((20 + sumLength + (sidesLength + 1) * rollResults.length) > 2000) {		//stay within 2000 character limit
				return message.reply('Too many dice to display, Total Sum is: ' + `[${sum.toString()}]`);
			}
			return message.reply(`[${rollResults.toString()}] ${rollFlavour}` + ', Total Sum is: ' + `[${sum.toString()}]`);
		} else {
			return message.reply((Math.floor(Math.random() * sides) + 1) + ' ' + rollFlavour);
		}
	}
});

function loginSuccess(result) {
  console.log("Logged in as " + client.user.username + "!");
}

function loginFailure(error) {
  console.log("Failed to log in! Close this window and try again.");
}