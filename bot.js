//Program: Discord Bot
//Author: Justin Ong
//Version: 1.3.2

//TODO: Refactor code, possibly split into various files? Also consider classes.

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
var isPaused = false;

client.on("message", msg => {
    if (msg.content[0] != (config.prefix) || msg.author.bot) {  //check for prefix and ID of caller to prevent loops and accidental calls
        return;
    }
    
    let cmd = msg.content.slice(1); //remove prefix
    let initialSplit = cmd.split(" ");
    let firstWord = initialSplit[0];
    
    //Dice roller
    //TODO: Use custom parser instead of eval()
    if (firstWord === "roll") {
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
    
    //Music player
    //TODO: Stop, List
    //TODO: Allow for playlists to be added, bugfix queue
    //why does adding songs to queue sometimes lag the bot and sometimes not work
    else if (firstWord === "play") {
        if (isPaused) {
            dispatcher.resume()
        }
        else {
            let url = initialSplit[1];

            if (ytdl.validateURL(url)) {
                
                playlist.push(url);
                console.log(playlist.length);
                
                if (msg.member.voiceChannel) {
                    if (dispatcher === null || !dispatcher.speaking) {
                        msg.member.voiceChannel.join()
                            .then(connection => {
                                
                                isPaused = false;
                                
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
    }
    else if (firstWord === "pause") {
        isPaused = true;
        dispatcher.pause();
    }
/*     else if (firstWord === "skip") {
        dispatcher.end();
    }
    else if (firstWord === "stop") {
        playlist = [playlist.shift];
        dispatcher.end();
        playlist.length = 0;
    } 
    else if (firstWord === "list") {
        msg.channel.send(playlist.join(", "));
    } */
    
    //Other commands, emoji, pingpong, debugging
    else {
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
                msg.channel.send("", {
                    "files": ["./Emojis/SleepySparks.gif"]
                });
                break;
            case "sparksshine":
                msg.channel.send("", {
                    "files": ["./Emojis/SparksShine.gif"]
                });
                break;
            case "rindouyay":
                msg.channel.send("", {
                    "files": ["./Emojis/RindouYay.gif"]
                });
                break;
            case "jesus":
                msg.channel.send("", {
                    "files": ["./Emojis/JCKid.gif"]
                });
                break;
            case "thisisfine":
                msg.channel.send("", {
                    "files": ["./Emojis/ThisIsFine.gif"]
                });
                break;
            case "butwhy":
                msg.channel.send("", {
                    "files": ["./Emojis/ButWhy.gif"]
                });
                break;
            case "diabetes":
                msg.channel.send("", {
                    "files": ["./Emojis/Diabetes.gif"]
                });
                break;
            case "2meirl4meirl":
                msg.channel.send("", {
                    "files": ["./Emojis/2meirl4meirl.gif"]
                });
                break;
            case "thinking":
                msg.channel.send("", {
                    "files": ["./Emojis/ThinkingEmoji.gif"]
                });
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