const { SlashCommandBuilder } = require("discord.js");
const {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const play = require("play-dl");
const ytpl = require("ytpl");
const ytsr = require("ytsr");

var connection = undefined;
var audioPlayer = createAudioPlayer();
var playlist = [];
var searchList = [];
var searchStartTime = Date();
var isSearching = false;
var searchText = "";
var isLoopingOne = false;
var isLoopingAll = false;
var isFirstPlay = true;

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
  playlist,
  playSong,
  setLoopOne,
  setLoopAll,
  setLoopOff,
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
    parseSongInput(interaction, input);
  }
}

function parseSongInput(interaction, input) {
  let playlist_id = input.split("list=")[1];
  let video_id = input.split("&")[0].split("watch?v=")[1];
  if (playlist_id && ytpl.validateID(playlist_id)) {
    ytpl(input, {
      limit: Infinity,
    })
      .then((playlist) => {
        addListToQueue(interaction, playlist);
      })
      .catch(console.log);
  } else if (video_id && ytdl.validateID(video_id)) {
    addSongToQueue(interaction, input);
  } else {
    search(interaction, input);
  }
}

async function addSongToQueue(interaction, song) {
  let info = await ytdl.getInfo(song);
  playlist.push(song);
  console.log(playlist.length + " songs in queue");
  if (playlist.length === 1) {
    playSong();
    console.log("Playing " + info.videoDetails.title);
    interaction.editReply("Playing " + info.videoDetails.title);
  } else {
    interaction.editReply("Added " + info.videoDetails.title + " to queue");
  }
}

function addListToQueue(interaction, playlist) {
  for (let i = 0; i < playlist.items.length; i++) {
    addSongToQueue(interaction, playlist.items[i].shortUrl);
  }
  console.log("Added playlist " + playlist.title + " to queue");
}

async function search(interaction, song) {
  if (new Date() - searchStartTime > 10000) {
    searchList.length = 0;
    isSearching = false;
    searchText = null;
  }
  if (isSearching) {
    if (song in searchChoices) {
      let songNum = song / 1 - 1;
      interaction.editReply(
        "Selected " + song + ": " + searchList[songNum].title
      );
      addSongToQueue(interaction, searchList[songNum].URL);
      searchList.length = 0;
      isSearching = false;
      searchText = null;
    } else {
      interaction.editReply("Invalid choice!");
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
    interaction
      .editReply(string)
      .then((message) => (searchText = message))
      .catch((err) => console.log(err));
    searchStartTime = new Date();
    isSearching = true;
  }
}

async function playSong() {
  if (playlist.length > 0) {
    var source = await play.stream(playlist[0], {
      discordPlayerCompatibility: true,
    });
    audioPlayer.play(
      createAudioResource(source.stream, {
        inputType: source.type,
      })
    );
    if (isFirstPlay) {
      isFirstPlay = false;
      audioPlayer.on(AudioPlayerStatus.Idle, () => {
        if (isLoopingAll) {
          playlist.push(playlist.shift());
        } else if (isLoopingOne) {
          //do nothing
        } else {
          playlist.shift();
        }
        playSong();
      });
      audioPlayer.on("error", (error) => {
        console.error(`Error: ${error.message}`);
        playlist.shift();
        if (playlist.length > 0) {
          playSong();
        }
      });
    }
  } else {
    audioPlayer.stop();
    console.log("Queue is empty!");
  }
}

function setLoopOne() {
  isLoopingOne = true;
  isLoopingAll = false;
}

function setLoopAll() {
  isLoopingOne = false;
  isLoopingAll = true;
}

function setLoopOff() {
  isLoopingOne = false;
  isLoopingAll = false;
}
