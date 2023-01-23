const { SlashCommandBuilder } = require("discord.js");
const {
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const ytsr = require("ytsr");

var connection = undefined;
var audioPlayer = createAudioPlayer();
var playlist = [];
var searchList = [];
var searchStartTime = null;
var isSearching = false;
var searchText = "";

const searchChoices = [1, 2, 3, 4, 5];
const subscription = undefined;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from a YouTube link")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("The YouTube link to play")
        .setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString("input");
    await interaction.deferReply();
    await getConnection(interaction, input);
  },
};

function getConnection(interaction, input) {
  let channel = interaction.member.voice.channel;
  if (!interaction.member.voice.channel) {
    interaction.editReply("You need to join a voice channel first!");
  } else {
    connection = getVoiceConnection(channel.guild.id);
    if (connection === undefined) {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
    }

    connection.subscribe(audioPlayer);
    connection.on(VoiceConnectionStatus.Ready, () => {
      playSong();
    });

    parseSongInput(input);
  }
}

function parseSongInput(input) {
  let playlist_id = input.split("list=")[1];
  let video_id = input.split("&")[0].split("watch?v=")[1];
  if (ytpl.validateID(playlist_id)) {
    ytpl(input, {
      limit: Infinity,
    })
      .then((playlist) => {
        addListToQueue(playlist);
      })
      .catch(console.log);
  } else if (ytdl.validateID(video_id)) {
    addSongToQueue(input);
  } else {
    search(input);
  }
}

function addSongToQueue(song) {
  playlist.push(song);
  if (playlist.length === 1) {
    playSong();
  }
}

function addListToQueue(playlist) {
  for (let i = 0; i < playlist.items.length; i++) {
    addSongToQueue(playlist.items[i].shortUrl);
  }
  console.log("Added playlist " + playlist.title + " to queue");
}

async function search(msg, song) {
  if (new Date() - searchStartTime > 10000) {
    searchList.length = 0;
    isSearching = false;
    searchText = null;
  }
  if (isSearching) {
    if (song in searchChoices) {
      let songNum = song / 1 - 1;
      addSongToQueue(searchList[songNum].URL);
      searchText.edit("Selected " + song + ": " + searchList[songNum].title);
      searchList.length = 0;
      isSearching = false;
      searchText = null;
    } else {
      msg.channel.send("Invalid choice!");
    }
  } else {
    const filters = await ytsr.getFilters(song);
    const filter = filters.get("Type").get("Video");
    const result = await ytsr(filter.url, {
      limit: 5,
    });
    let string = "";
    for (let i = 0; i < result.items.length; i++) {
      if (
        result.items[i].type === "video" &&
        searchList.length < searchChoices.length
      ) {
        searchList.push({
          title: result.items[i].title,
          URL: result.items[i].url,
        });
        string += searchList.length + ": " + result.items[i].title + "\n";
      }
    }
    msg.channel
      .send(string)
      .then((message) => (searchText = message))
      .catch((err) => console.log(err));
    searchStartTime = new Date();
    isSearching = true;
  }
}

async function playSong() {
  if (playlist.length > 0) {
    let info = await ytdl.getInfo(playlist[0]);
    console.log("Playing " + info.videoDetails.title);
    console.log(playlist.length + " songs in queue");

    audioPlayer.play(
      createAudioResource(
        ytdl(playlist[0], {
          //quality: "highestaudio",
          //highWaterMark: 1 << 25,
        })
      )
    );
    audioPlayer.on("error", (error) => {
      console.error(
        `Error: ${error.message} with resource ${error.resource.metadata.title}`
      );
      playSong();
    });
  } else {
    console.log("Queue is empty!");
  }
}
