//Program: Discord Bot
//Author: Justin Ong
//Version: 1.3.0

//TODO: Refactor code, possibly split into various files?

const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const config = require("./config.json");
const fs = require("fs");
const client = new Discord.Client();

//login using token defined in config.json
client.login(config.token).then(loginSuccess, loginFailure);

client.on("ready", () => {
    client.user.setActivity(config.prefix + "help");
});

var playlist = playlist || [];  //set up variables for song playing
var dispatcher = null;

client.on("message", msg => {
    if (msg.content[0] != (config.prefix) || msg.author.bot) {  //check for prefix and ID of caller to prevent loops and accidental calls
        return;
    }
    
    let cmd = msg.content.slice(1); //remove prefix
    let initialSplit = cmd.split(" ");
    let firstWord = initialSplit[0];
    
    if (firstWord === "roll") {
        //Dice roller
        //TODO: Use custom parser instead of eval()
        
        let text = cmd.replace(/\s+/g, "");   //remove any excess whitespace
        let input = text.slice(4);  //remove "roll"
        let format = RegExp(/([1-9][0-9]*)(d)([1-9][0-9]*)/);   //find XdY
        let mainRoll = format.exec(input);
        let rollFlavour = input.slice(mainRoll[0].length);

        if (mainRoll === null) {
            msg.reply("Invalid Input!");
            return;
        }
        
        let rolls = mainRoll[1] / 1;
        let sides = mainRoll[3] / 1;
        let sum = 0;
        
        let rollResults = [];       //store rolls in an array
        
        for (let i = 0; i < rolls; i++) {
            rollResults.push(Math.floor(Math.random() * sides) + 1);
            sum += rollResults[i];
        }

        sum = eval(sum + rollFlavour);
        
        let tempResults = rollResults.join(", ");
        let tempFlavour = rollFlavour.split("").join(" ");
        
        let ans = "[" + tempResults + "] " + tempFlavour + ", Total Sum is: " + sum;
        
        if (ans.length > 2000) {     //stay within 2000 character limit
            return msg.reply("Too many dice to display, Total Sum is: " + sum);
        }
        return msg.reply(ans);
    }
    else if (firstWord === "play") {
        //Music player
        //TODO: Pause, Resume, Stop, List
        //TODO: Allow for playlists to be added, bugfix queue
        //why does adding songs to queue sometimes lag the bot and sometimes not work
            
        let url = initialSplit[1];

        if (ytdl.validateURL(url)) {
            
            playlist.push(url);
            console.log(playlist.length);
            
            if (msg.member.voiceChannel) {
                if (dispatcher === null || !dispatcher.speaking) {
                    msg.member.voiceChannel.join()
                        .then(connection => {
                            
                            dispatcher = connection.playStream(ytdl(playlist[0], {filter: "audioonly"}));
                            //msg.reply("I have successfully connected to the channel!");
                            //const dispatcher = connection.playFile("C:/P/A/T/H.mp3");  //play local files
                            
                            dispatcher.on("end", () => {
                                if (playlist.length) {
                                    playlist.shift();
                                    console.log(playlist.length);
                                    dispatcher = connection.playStream(ytdl(playlist[0], {filter: "audioonly"}));
                                }
                            })
                        })
                        .catch(console.log);
                }
            }
            else {
                msg.reply("You need to join a voice channel first!");
            }
        }
        else {
            msg.reply("Your URL is invalid!");
        }
    }
    else {
        //Other commands, emoji, pingpong, debugging
        //TODO: Refactor code to be more readable
        
        switch(cmd) {
            case "help":
                msg.reply("The following commands are valid: roll, play (YT videos), ping, pong, sleepysparks, sparksshine, rindouyay, jesus, thisisfine, butwhy, diabetes, 2meirl4meirl, thinking, pingtest, logout");
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