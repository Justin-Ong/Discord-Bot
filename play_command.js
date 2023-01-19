const { getVoiceConnection, joinVoiceChannel, SlashCommandBuilder } = require("discord.js");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const ytsr = require("ytsr");

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
    await musicPlayer(interaction, input);
  },
};

function musicPlayer(interaction, msg) {
  console.log(msg);
  let channel = interaction.member.voice.channel;
  if (!interaction.member.voice.channel) {
    interaction.editReply("You need to join a voice channel first!");
  } else {
    const connection = getVoiceConnection(channel.guild.id);
  }
}
