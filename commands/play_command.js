const { SlashCommandBuilder } = require("discord.js");
const {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} = require("@discordjs/voice");
const play = require("play-dl");

var connection = undefined;
var audioPlayer = createAudioPlayer();
var playlist = [];
var searchList = [];
var searchStartTime = new Date();
var isSearching = false;
var isLoopingOne = false;
var isLoopingAll = false;
var isFirstPlay = true;

const searchChoices = [1, 2, 3, 4, 5];

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

async function parseSongInput(interaction, input) {
  const validation = play.yt_validate(input);
  if (validation === "playlist") {
    try {
      const pl = await play.playlist_info(input, { incomplete: true });
      const videos = await pl.all_videos();
      addListToQueue(interaction, pl.title, videos);
    } catch (err) {
      console.log(err);
      interaction.editReply("Failed to load playlist.");
    }
  } else if (validation === "video") {
    addSongToQueue(interaction, input);
  } else {
    search(interaction, input);
  }
}

async function addSongToQueue(interaction, song) {
  let info = await play.video_info(song);
  let title = info.video_details.title;
  playlist.push(song);
  console.log(playlist.length + " songs in queue");
  if (playlist.length === 1) {
    playSong();
    console.log("Playing " + title);
    interaction.editReply("Playing " + title);
  } else {
    interaction.editReply("Added " + title + " to queue");
  }
}

function addListToQueue(interaction, title, videos) {
  for (let i = 0; i < videos.length; i++) {
    addSongToQueue(interaction, videos[i].url);
  }
  console.log("Added playlist " + title + " to queue");
}

async function search(interaction, song) {
  if (new Date() - searchStartTime > 10000) {
    searchList.length = 0;
    isSearching = false;
  }
  if (isSearching) {
    if (song in searchChoices) {
      let songNum = song / 1 - 1;
      interaction.editReply(
        "Selected " + song + ": " + searchList[songNum].title
      );
      addSongToQueue(interaction, searchList[songNum].url);
      searchList.length = 0;
      isSearching = false;
    } else {
      interaction.editReply("Invalid choice!");
    }
  } else {
    const results = await play.search(song, { limit: 5 });
    let string = "";
    for (let i = 0; i < results.length; i++) {
      searchList.push({
        title: results[i].title,
        url: results[i].url,
      });
      string += searchList.length + ": " + results[i].title + "\n";
    }
    interaction
      .editReply(string)
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
