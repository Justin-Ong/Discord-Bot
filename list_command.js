const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("Lists current playlist"),
  async execute(interaction) {
    await interaction.reply("Skipping current song");
    let channel = interaction.member.voice.channel;
    if (pc.playlist.length >= 1) {
      pc.playlist.shift();
      pc.playSong();
    }
  },
};
