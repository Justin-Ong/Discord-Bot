//Program: Discord Bot
//Author: Justin Ong
//Version: 1.7.2
//TODO: Refactor code, possibly split into various files?

//Express server for keeping project alive with pings
const express = require("express");

const expressApp = express();
expressApp.get("/", (req, res) => res.json("OK"));
expressApp.listen(process.env.PORT);

//Monitoring setup
const fs = require("fs");

//Various inits
const Booru = require("booru");
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const YouTube = require("simple-youtube-api");
const youtube = new YouTube(process.env.YT_API_KEY);
const config = require("./config.json");
const counter = require("./counter.json");
const neko_log = require("./neko_log.json");
const startup_log = require("./startup_log.json");
const client = new Discord.Client();
const searchChoices = [1, 2, 3, 4, 5];

//login using token
client.login(process.env.SECRET).then(loginSuccess, loginFailure);

console.log("Starting...");

//defining Controller class to handle user input
class Controller {
  constructor() {
    this.playlist = []; //set up variables for song playing
    this.searchList = [];
    this.currConnection = null;
    this.currChannel = null;
    this.dispatcher = null;
    this.isPaused = false;
    this.isLoopingSingle = false;
    this.isLoopingList = false;
    this.isSearching = false;
    this.currInput = "";
    this.searchStartTime = null;
    this.channelTimeoutValue = 1200000;
    this.sauceList = [];
  }

  //Initial reading of input
  readInput(msg) {
    let cmd = msg.content.slice(1); //remove prefix
    let initialSplit = cmd.split(" ");
    let firstWord = initialSplit[0].toLowerCase(); //workaround because startswith() is for some reason not supported

    if (firstWord === "roll") {
      this.diceRoller(msg);
    } else if (firstWord === "play" || firstWord === "p") {
      let cmd = msg.content.slice(1 + firstWord.length);
      let initialSplit = cmd.trim();
      let song = initialSplit || "";

      this.musicPlayer(msg, song);
    } else if (firstWord === "neko") {
      this.neko(msg);
    } else {
      this.cmdHandler(msg);
    }
    
    let _this = this;
    let idleTimer = setTimeout(function () {
      if (_this.playlist.length == 0 && _this.currChannel != null) {
        _this.currChannel.leave();
        _this.currChannel = null;
      }
      else {
        idleTimer.refresh();
      }
    }, this.channelTimeoutValue);
  }

  //Dice roller
  //TODO: Use custom parser instead of eval()
  diceRoller(msg) {
    let input = msg.content.slice(1);
    let text = input.replace(/\s+/g, ""); //remove any whitespace
    let temp = text.slice(4); //remove "roll"
    let format = RegExp(/(\d*)(d)(\d*)/); //find XdY
    let mainRoll = format.exec(temp);
    let rollFlavour = temp.slice(mainRoll[0].length);

    if (mainRoll === null) {
      msg.reply("Invalid Input!");
      return;
    }

    let rolls = mainRoll[1] / 1;
    let sides = mainRoll[3] / 1;
    let sum = 0;

    let rollResults = []; //store rolls in an array

    for (let i = 0; i < rolls; i++) {
      rollResults.push(Math.floor(Math.random() * sides) + 1);
      sum += rollResults[i];
    }

    sum = eval(sum + rollFlavour);

    let tempResults = rollResults.join(", ");
    let tempFlavour = rollFlavour.split(/([+\-\*\/])/).join(" ");

    let ans = "[" + tempResults + "] " + tempFlavour + ", Total Sum is: " + sum;

    if (ans.length > 2000) {
      //stay within 2000 character limit
      return msg.reply("Too many dice to display, Total Sum is: " + sum);
    }
    return msg.reply(ans);
  }

  //Music player
  musicPlayer(msg, song) {
    if (!msg.member.voice.channel) {
      msg.reply("You need to join a voice channel first!");
    } else {
      if (this.currConnection == null) {
        this.getConnection(msg).then(() => this.parseInput(msg, song));
      } else {
        this.parseInput(msg, song);
      }
    }
  }
 
  parseInput(msg, song) {
    let _this = this;
    return new Promise(function(resolve, reject) {
      try {
        if (ytpl.validateURL(song)) {
          youtube.getPlaylist(song)
            .then(playlist => {
               playlist.getVideos()
                 .then(videos => {
                   _this.addListToQueue(videos);
                 })
                 .catch(console.log);
            });
        } else if (ytdl.validateURL(song)) {
          _this.addSongToQueue(song);
        } else {
          ytsr(song, { limit: 10 }, function(err, result) {
            if (err) {
              throw err;
            } else {
              if (_this.isSearching) {
                if (new Date() - _this.searchStartTime > 10000) {
                  _this.searchList.length = 0;
                  _this.isSearching = false;
                } else if (song in searchChoices) {
                  song = song / 1 - 1;
                  _this.addSongToQueue(_this.searchList[song].URL);
                  _this.searchList.length = 0;
                  _this.isSearching = false;
                } else {
                  msg.channel.send("Only one search at a time, please!");
                }
              } else {
                let string = "";
                for (let i = 0; i < result.items.length; i++) {
                  if (
                    result.items[i].type === "video" &&
                    _this.searchList.length < searchChoices.length
                  ) {
                    _this.searchList.push({
                      title: result.items[i].title,
                      URL: result.items[i].link
                    });
                    string +=
                      _this.searchList.length +
                      ": " +
                      result.items[i].title +
                      "\n";
                  }
                }
                msg.channel.send(string).then(() => {
                  _this.searchStartTime = new Date();
                  _this.isSearching = true;
                });
              }
            }
          });
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  getConnection(msg) {
    let _this = this;
    return new Promise(function(resolve, reject) {
      _this.currChannel = msg.member.voice.channel;
      if (_this.currConnection == null) {
        try {
          _this.currChannel
            .join()
            .then(connection => {
              _this.currConnection = connection;
              resolve();
            })
            .catch(console.log);
        } catch (err) {
          reject(err);
        }
      }
    });
  }

  addSongToQueue(song) {
    let _this = this;
    ytdl.getInfo(song, function(err, info) {
      let title = info.title;
      let duration = new Date(info.length_seconds * 1000)
        .toISOString()
        .substr(11, 8);
      _this.playlist.push({ url: song, title: title, duration: duration });
      console.log("Added " + title + " to queue");
      console.log(_this.playlist.length + " songs in queue");
      if (_this.playlist.length == 1) {
        _this.playMusic();
      }
    });
  }

  addListToQueue(list) {
    for (let i = 0; i < list.length; i++) {
      this.addSongToQueue(list[i].id);
    }
  }

  playMusic() {
    if (this.playlist.length > 0) {
      console.log("Playing " + this.playlist[0].title);
      console.log(this.playlist.length + " songs in queue");

      this.dispatcher = this.currConnection
        .play(ytdl(this.playlist[0].url, {quality: 'highestaudio', highWaterMark: 1 << 25}))
        .on("finish", () => {
          if (this.playlist.length > 0) {
            if (this.isLoopingList == true) {
              this.playlist.push(this.playlist.shift());
            } else if (this.isLoopingSingle == true) {
              //do nothing
            } else {
              this.playlist.shift();
            }
            this.playMusic();
          }
        })
        .on("error", console.error);
    } else {
      console.log("Queue is empty!");
    }
  }

  //Booru image scraper
  //TODO: Look into improving speed
  neko(msg) {
    let siteArray = config.sites;
    let site = siteArray[Math.floor(Math.random() * siteArray.length)];
    Booru.search(site, ["nekomimi", "rating:safe", "-comic", "-text"], {
      limit: 1,
      random: true
    })
      .then(posts => {
        var imageUrl = posts[0].fileUrl;
        console.log("Sending neko: " + imageUrl + " at " + Date());
        this.sauceList.unshift(imageUrl);
        if (this.sauceList.length > 5) {
          this.sauceList.pop()
        }
        msg.channel
          .send({
            files: [imageUrl]
          })
          .catch(err => {
            var error = err;
            console.log("Error sending image from: " + imageUrl);
            console.log(error);
            this.sauceList.shift(imageUrl);
            console.log("retrying...");
            fs.readFile("neko_log.json", function(err, data) {
              if (err) {
                throw "Could not log neko error because: " + err;
              }

              startup_log.reason = error;

              fs.writeFile(
                "neko_log.json",
                JSON.stringify(neko_log, null, 2),
                function(err) {
                  if (err) {
                    return console.log(err);
                  }
                }
              );
            });
            this.neko(msg);
          });
      })
      .catch(err => {
        if (err.name === "booruError") {
          console.log(err.message);
        } else {
          console.log(err);
          console.log("retrying...");
          this.neko(msg);
        }
      });
  }

  //Other commands, emoji, pingpong, debugging
  cmdHandler(msg) {
    let cmd = msg.content.slice(1);
    let count = parseInt(counter.count, 10);
    let string = "";
    switch (cmd) {
      case "help":
        msg.reply(
          "The following commands are valid: roll, play (YT videos, playlists or search), pause, resume, stop, skip, " +
            "loop one, loop all, loop off, ping, pong, sleepysparks, sparksshine, rindouyay, jesus, thisisfine, " +
            "butwhy, diabetes, 2meirl4meirl, thinking, pingtest, neko, sauce, reset, logout"
        );
        break;
      case "pause":
        if (!this.playlist.length) {
          msg.reply("there are no songs in the queue!");
        } else if (this.isPaused) {
          msg.reply("the player is already paused!");
        } else {
          msg.reply("the player has been paused.");
          this.isPaused = true;
          this.dispatcher.pause();
        }
        break;
      case "resume":
        if (!this.isPaused || !this.playlist.length) {
          msg.reply("nothing is paused!");
        } else {
          this.isPaused = false;
          this.dispatcher.resume();
        }
        break;
      case "skip":
      case "s":
        if (!this.playlist.length) {
          msg.reply("there are no songs in the queue!");
        } else {
          msg.reply(this.playlist[0].title + " has been skipped.");
          this.dispatcher.end();
        }
        break;
      case "stop":
        if (!this.playlist.length) {
          msg.reply("nothing is playing!");
        } else {
          msg.reply("the player has been stopped.");
          this.playlist.length = 0;
          this.dispatcher.end();
        }
        break;
      case "list":
      case "l":
        if (!this.playlist.length) {
          msg.reply("there are no songs in the queue!");
        } else {
          try {
            let result = "";
            for (let i = 0; i < 5; i++) {
              let song = this.playlist[i];
              if (song == undefined) {
                break;
              }
              let song_title = song.title;
              let song_duration = song.duration;
              result += "Song " + (i + 1) + ": " + song_title + ", Duration: " + song_duration + "\n";
            }
            result += this.playlist.length + " songs in queue";
            msg.channel.send(result);
          } catch (err) {
            console.log(err);
            msg.channel.send("Sorry, an error occurred.");
          }
        }
        break;
      case "loop one":
        if (!this.playlist.length) {
          msg.reply("there are no songs in the queue!");
        } else {
          this.isLoopingList = false;
          this.isLoopingSingle = true;
          console.log("looping: " + this.playlist[0].title);
          msg.channel.send("Now looping: " + this.playlist[0].title);
        }
        break;
      case "loop all":
        if (!this.playlist.length) {
          msg.reply("there are no songs in the queue!");
        } else {
          this.isLoopingSingle = false;
          this.isLoopingList = true;
          console.log("looping songs in current playlist");
          msg.channel.send("Now looping songs in current playlist.");
        }
        break;
      case "loop off":
        this.isLoopingSingle = false;
        this.isLoopingList = false;
        console.log("looping off");
        msg.channel.send("Looping has been stopped.");
        break;
      case "sauce":
        let result = ""
        if (!this.sauceList.length) {
          msg.reply("no images in source list");
        } else {
          result += "5 most recent image sources:\n"; 
          for (let i = 1; i < this.sauceList.length + 1; i++) {
            result += i + ": <" + this.sauceList[i - 1] + ">\n";
          }
        }
        msg.channel.send(result);
        break;
      case "ping":
        msg.reply("pong!");
        break;
      case "pong":
        msg.reply("ping!");
        break;
      case "sleepysparks":
        var embed = new Discord.MessageEmbed().setImage(
          "https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FSleepySparks.gif?v=1571569391112"
        );
        msg.channel.send({ embed });
        break;
      case "sparksshine":
        var embed = new Discord.MessageEmbed().setImage(
          "https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FSparksShine.gif?v=1571569401801"
        );
        msg.channel.send({ embed });
        break;
      case "rindouyay":
        var embed = new Discord.MessageEmbed().setImage(
          "https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FRindouYay.gif?v=1571569402211"
        );
        msg.channel.send({ embed });
        break;
      case "jesus":
        var embed = new Discord.MessageEmbed().setImage(
          "https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FJCKid.gif?v=1571569403502"
        );
        msg.channel.send({ embed });
        break;
      case "thisisfine":
        var embed = new Discord.MessageEmbed().setImage(
          "https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FThisIsFine.gif?v=1571569445819"
        );
        msg.channel.send({ embed });
        break;
      case "butwhy":
        var embed = new Discord.MessageEmbed().setImage(
          "https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FButWhy.gif?v=1571569461101"
        );
        msg.channel.send({ embed });
        break;
      case "diabetes":
        var embed = new Discord.MessageEmbed().setImage(
          "https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FDiabetes.gif?v=1571569404078"
        );
        msg.channel.send({ embed });
        break;
      case "2meirl4meirl":
        var embed = new Discord.MessageEmbed().setImage(
          "https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2F2meirl4meirl.gif?v=1571569377639"
        );
        msg.channel.send({ embed });
        break;
      case "thinking":
        var embed = new Discord.MessageEmbed().setImage(
          "https://cdn.glitch.com/2998cee4-c4b7-47b9-a4a1-c6e9a9bdad8c%2FThinkingEmoji.gif?v=1571569423231"
        );
        msg.channel.send({ embed });
        break;
      case "pingtest":
        msg.channel.send("Pinging...").then(sent => {
          sent.edit(
            "Took " + `${sent.createdTimestamp - msg.createdTimestamp}` + " ms"
          );
        });
        break;
      case "count":
        count++;
        counter.count = count;
        fs.writeFile("counter.json", JSON.stringify(counter, null, 2), function(
          err
        ) {
          if (err) return console.log(err);
          console.log(JSON.stringify(counter));
          console.log("writing to " + "counter.json");
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
        fs.writeFile("counter.json", JSON.stringify(counter, null, 2), function(
          err
        ) {
          if (err) return console.log(err);
          console.log(JSON.stringify(counter));
          console.log("writing to " + "counter.json");
        });
        string = "Current Kick Count: " + counter.count;
        msg.channel.send(string);
        break;
      case "destroy":
      case "reset":
      case "reboot":
        console.log("Restarting...");
        client.destroy();
        this.playlist.length = 0;
        this.sauceList.length = 0;
        this.currConnection = null;
        client.login(process.env.SECRET).then(loginSuccess, loginFailure);
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
  if (msg.content[0] != config.prefix || msg.author.bot) {
    return;
  }
  controller.readInput(msg);
});

function loginSuccess(result) {
  let now = Date();
  let string = "Logged in as " + client.user.username + " at " + now;
  fs.readFile("startup_log.json", function(err, data) {
    if (err) {
      throw "could not read log file due to: " + err;
    }

    startup_log.prev_success = startup_log.curr_success;
    startup_log.curr_success = string;

    fs.writeFile(
      "startup_log.json",
      JSON.stringify(startup_log, null, 2),
      function(err) {
        if (err) {
          return console.log(err);
        }
        console.log(string);
      }
    );
  });
}

function loginFailure(error) {
  let now = Date();
  let string = "Failed to log in at " + now + " due to: " + error;
  fs.readFile("startup_log.json", function(err, data) {
    if (err) {
      throw "could not read log file due to: " + err;
    }
    startup_log.prev_failure = startup_log.curr_failure;
    startup_log.curr_failure = string;

    fs.writeFile(
      "startup_log.json",
      JSON.stringify(startup_log, null, 2),
      function(err) {
        if (err) {
          return console.log(err);
        }
        console.log(string);
      }
    );
  });
}
