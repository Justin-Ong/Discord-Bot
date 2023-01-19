const { SlashCommandBuilder } = require("discord.js");
const { createAudioPlayer, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const ytsr = require("ytsr");

var connection = undefined;
var audioPlayer = createAudioPlayer();
const subscription = undefined;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from a YouTube link")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("The song link to play")
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
    
    parseSongInput(input);
  }
}

function parseSongInput(input) {
  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log(
      "The connection has entered the Ready state - ready to play audio!"
    );
  });
  
  connection.subscribe(audioPlayer);
}
