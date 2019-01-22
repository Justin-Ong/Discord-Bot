//Program: Discord Bot
//Author: Justin Ong
//Version: 1.4.0

//TODO: Refactor code, possibly split into various files?

const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const config = require("./config.json");
const client = new Discord.Client();

//login using token defined in config.json
client.login(config.token).then(loginSuccess, loginFailure);

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
        let firstWord = initialSplit[0];    //workaround because startswith() is for some reason not supported
        
        if (firstWord === "roll") {
            this.diceRoller(msg);
        }
        else if (firstWord === "play") {
            let cmd = msg.content.slice(1);
            let initialSplit = cmd.split(" ");
            let song = initialSplit[1];
            
            this.musicPlayer(msg, song);
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
        let format = RegExp(/([1-9][0-9]*)(d)([1-9][0-9]*)/);   //find XdY
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
        let tempFlavour = rollFlavour.split("").join(" ");
        
        let ans = "[" + tempResults + "] " + tempFlavour + ", Total Sum is: " + sum;
        
        if (ans.length > 2000) {     //stay within 2000 character limit
            return msg.reply("Too many dice to display, Total Sum is: " + sum);
        }
        return msg.reply(ans);
    }
    
    //Music player
    //TODO: Allow for playlists to be added, bugfix queue
    //why does adding songs to queue sometimes lag the bot and sometimes not work
    musicPlayer(msg, song) {
        if (this.isPaused) {
            this.isPaused = false;
            this.dispatcher.resume();
        }
        else {
            if (ytdl.validateURL(song)) {
                if (msg.member.voiceChannel) {
                    this.playlist.push(song);
                    console.log(this.playlist.length + " songs in queue");
                    
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
    }
    
    play(connection) {        
        console.log("Playing " + this.playlist[0]);
        console.log(this.playlist.length + " songs in queue");
        
        this.dispatcher = connection.playStream(ytdl(this.playlist[0], {filter: "audioonly"}));
        this.dispatcher.on("end", () => {
            if (this.playlist.length) {
                this.playlist.shift();
                this.play(connection);
            }
        });
    }
    
    //Other commands, emoji, pingpong, debugging
    cmdHandler(msg) {
        let cmd = msg.content.slice(1);
        
        switch(cmd) {
            case "help":
                msg.reply("The following commands are valid: roll, play (YT videos), ping, pong, sleepysparks, " +
                          "sparksshine, rindouyay, jesus, thisisfine, butwhy, diabetes, 2meirl4meirl, thinking, " +
                          "pingtest, logout"
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
            case "skip":
                if (!this.playlist.length) {
                    msg.reply("there are no songs in the queue!");
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
}


//create Controller
controller = new Controller();

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

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));