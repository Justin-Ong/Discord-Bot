//Program: Discord Bot
//Author: Justin Ong
//Version: 1.6.2

const express = require("express");
const expressApp = express();
expressApp.get("/", (req, res) => res.json("OK"));
expressApp.listen(process.env.PORT);

//TODO: Refactor code, possibly split into various files?

const Booru = require("booru");
const Discord = require("discord.js");
var fs = require("fs");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const config = require("./config.json");
const counter = require("./counter.json");
const client = new Discord.Client();

//login using token defined in config.json
client.login(process.env.SECRET).then(loginSuccess, loginFailure);

//defining Controller class to handle user input
class Controller {
    constructor() {
        this.playlist = [];  //set up variables for song playing
        this.dispatcher = null;
        this.isPaused = false;
        this.currInput = "";
    }
    
    //Initial reading of input
    readInput(msg) {
        let cmd = msg.content.slice(1); //remove prefix
        let initialSplit = cmd.split(" ");
        let firstWord = initialSplit[0].toLowerCase();    //workaround because startswith() is for some reason not supported
        
        if (firstWord === "roll") {
            this.diceRoller(msg);
        }
        else if (firstWord === "play" || firstWord === "p") {
            let cmd = msg.content.slice(1 + firstWord.length);
            let initialSplit = cmd.trim();
            let song = initialSplit || "";
            
            this.musicPlayer(msg, song);
        }
		else if (firstWord === "neko") {
			this.neko(msg);
		}
        else {
            this.cmdHandler(msg);
        }
    }

    //Dice roller
    //TODO: Use custom parser instead of eval()
    diceRoller(msg) {
        let input = msg.content.slice(1);
        let text = input.replace(/\s+/g, "");   //remove any whitespace
        let temp = text.slice(4);  //remove "roll"
        let format = RegExp(/(\d*)(d)(\d*)/);   //find XdY
        let mainRoll = format.exec(temp);
        let rollFlavour = temp.slice(mainRoll[0].length);

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
        let tempFlavour = rollFlavour.split(/([+\-\*\/])/).join(" ");
        
        let ans = "[" + tempResults + "] " + tempFlavour + ", Total Sum is: " + sum;
        
        if (ans.length > 2000) {     //stay within 2000 character limit
            return msg.reply("Too many dice to display, Total Sum is: " + sum);
        }
        return msg.reply(ans);
    }
    
    //Music player
    //TODO: Add search functionality
    musicPlayer(msg, song) {
        if (ytpl.validateURL(song)) {          
            if (msg.member.voiceChannel) {
                song = song.split("list=")[1];
                song = song.split("&index=")[0];
                ytpl(song, 0)
                    .then(result => {
                        this.addListToQueue(result.items);
                    })
                    .catch(console.log);
                if (this.dispatcher === null || !this.dispatcher.speaking) {
                    msg.member.voiceChannel.join()
                        .then(connection => {                            
                            this.play(connection);
                        })
                        .catch(console.log);
                }
            }
            else {
                msg.reply("You need to join a voice channel first!");
            }
        }
        else if (ytdl.validateURL(song)) {
            if (msg.member.voiceChannel) {
                this.addSongToQueue(song);
              
                if (this.dispatcher === null || !this.dispatcher.speaking) {
                    msg.member.voiceChannel.join()
                        .then(connection => {                            
                            this.play(connection);
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
  
    addSongToQueue(song) {
        this.playlist.push(song);
        console.log(this.playlist.length + " songs in queue");
    }
  
    addListToQueue(list) {
        for (let i in list) {
            this.addSongToQueue(list[i].url_simple);
        }
    }
    
    play(connection) {        
        if (this.playlist.length > 0) {
          console.log("Playing " + this.playlist[0]);
          console.log(this.playlist.length + " songs in queue");

          this.dispatcher = connection.playStream(ytdl(this.playlist[0], {filter: "audioonly"}))
              .on("end", () => {
                  if (this.playlist.length) {
                      this.playlist.shift();
                      this.play(connection);
                  }
              })
              .on("error", console.error);
        }
        else {
          console.log("Queue is empty!")
        }
    }
    
    //Booru image scraper
    //TODO: Look into improving speed
    neko(msg) {
        let siteArray = config.sites;
        let site = siteArray[Math.floor(Math.random() * siteArray.length)];
        Booru.search(site, ['nekomimi', 'rating:safe', '-comic', '-text'], {limit: 1, random: true})
            .then(posts => {
            var imageUrl = posts[0].fileUrl;
                console.log('Sending neko: ' + imageUrl + ' at ' + Date());
                msg.channel.send({
                    file:imageUrl
                })
            .catch(err => {
                console.log('Error sending image from: ' + imageUrl);
                console.log('retrying...');
                this.neko(msg);
            });
        })
        .catch(err => {
            if (err.name === 'booruError') {
                console.log(err.message);
            } else {
                console.log(err);
                console.log('retrying...');
                this.neko(msg);
            }
        });
    }
	
    //Other commands, emoji, pingpong, debugging
    cmdHandler(msg) {
        let cmd = msg.content.slice(1);
        let count = parseInt(counter.count, 10);
        let string = '';
        switch(cmd) {
            case "help":
                msg.reply("The following commands are valid: roll, play (YT videos), pause, resume, stop, skip, " +
                          "ping, pong, sleepysparks, sparksshine, rindouyay, jesus, thisisfine, butwhy, diabetes, " +
                          "2meirl4meirl, thinking, pingtest, logout"
                          );
                break;
            case "pause":
                if (!this.playlist.length) {
                    msg.reply("there are no songs in the queue!");
                }
                else if (this.isPaused) {
                    msg.reply("the player is already paused!");
                }
                else {
                    msg.reply("the player has been paused.");
                    this.isPaused = true;
                    this.dispatcher.pause();
                }
                break;
            case "resume":
                if (!this.isPaused || !this.playlist.length) {
                    msg.reply("nothing is paused!");
                }
                else {
                    this.isPaused = false;
                    this.dispatcher.resume();
                }
                break;
            case "skip":
            case "s":
                if (!this.playlist.length) {
                    msg.reply("there are no songs in the queue!");
                }
                else if (this.playlist.length === 1) {
                    msg.reply("skipped!");
                    this.playlist.length = 0;
                    this.dispatcher.end();
                }
                else {
                    msg.reply("skipped!");
                    this.dispatcher.end();
                }
                break;
            case "stop":
                if (!this.playlist.length) {
                    msg.reply("nothing is playing!");
                }
                else {
                    msg.reply("the player has been stopped!");
                    this.playlist.length = 0;
                    this.dispatcher.end();
                }
                break;
            case "list":
            case "l":
                if (!this.playlist.length) {
                    msg.reply("there are no songs in the queue!");
                }
                else {
                    msg.channel.send(this.playlist.join(", "));
                }
                break;
            case "ping":
                msg.reply("pong!");
                break;
            case "pong":
                msg.reply("ping!");
                break;
            case "sleepysparks":
                var embed = new Discord.RichEmbed().setImage("https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FSleepySparks.gif?v=1571569391112");
                msg.channel.send({ embed });
                break;
            case "sparksshine":
                var embed = new Discord.RichEmbed().setImage("https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FSparksShine.gif?v=1571569401801");
                msg.channel.send({ embed });
                break;
            case "rindouyay":
                var embed = new Discord.RichEmbed().setImage("https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FRindouYay.gif?v=1571569402211");
                msg.channel.send({ embed });
                break;
            case "jesus":
                var embed = new Discord.RichEmbed().setImage("https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FJCKid.gif?v=1571569403502");
                msg.channel.send({ embed });
                break;
            case "thisisfine":
                var embed = new Discord.RichEmbed().setImage("https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FThisIsFine.gif?v=1571569445819");
                msg.channel.send({ embed });
                break;
            case "butwhy":
                var embed = new Discord.RichEmbed().setImage("https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FButWhy.gif?v=1571569461101");
                msg.channel.send({ embed });
                break;
            case "diabetes":
                var embed = new Discord.RichEmbed().setImage("https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FDiabetes.gif?v=1571569404078");
                msg.channel.send({ embed });
                break;
            case "2meirl4meirl":
                var embed = new Discord.RichEmbed().setImage("https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2F2meirl4meirl.gif?v=1571569377639");
                msg.channel.send({ embed });
                break;
            case "thinking":
                var embed = new Discord.RichEmbed().setImage("https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FThinkingEmoji.gif?v=1571569423231");
                msg.channel.send({ embed });
                break;
            case "pingtest":
                msg.channel.send("Pinging...").then(sent => {
                    sent.edit("Took " + `${sent.createdTimestamp - msg.createdTimestamp}` + " ms");
                });
                break;
            case "count":
                count++;
                counter.count = count;
                fs.writeFile("counter.json", JSON.stringify(counter, null, 2), function (err) {
                    if (err) return console.log(err);
                    console.log(JSON.stringify(counter));
                    console.log('writing to ' + "counter.json");
                });
                string = "Current Kick Count: " + counter.count;
                msg.channel.send(string);
                break;
            case "currcount":
                count = parseInt(counter.count, 10);
                string = "Current Kick Count: " + count;
                msg.channel.send(string);
                break;
            case "resetcount":
                counter.count = 0;
                fs.writeFile("counter.json", JSON.stringify(counter, null, 2), function (err) {
                    if (err) return console.log(err);
                    console.log(JSON.stringify(counter));
                    console.log('writing to ' + "counter.json");
                });
                string = "Current Kick Count: " + counter.count;
                msg.channel.send(string);
                break;
            case "logout":
				console.log("Logging out...");
				client.destroy();
				console.log("Logged out!");
                break;
            default:
                msg.reply("No such command!");
        }
    }
}


//create Controller
var controller = new Controller();

client.on("ready", () => {
    client.user.setActivity(config.prefix + "help");
});

client.on("message", msg => {
    //check for prefix and ID of caller to prevent loops and accidental calls
    if (msg.content[0] != (config.prefix) || msg.author.bot) {  
        return;
    }
    controller.readInput(msg);
});

function loginSuccess(result) {
    console.log("Logged in as " + client.user.username + "!");
}

function loginFailure(error) {
    console.log("Failed to log in! Close this window and try again.");
}

//for debugging, uncomment to enable
//client.on("error", (e) => console.error(e));
//client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));