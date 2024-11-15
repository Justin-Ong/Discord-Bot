const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips current song"),
  async execute(interaction) {
    await interaction.reply("Skipping current song");
    if (pc.playlist.length >= 1) {
      pc.playlist.shift();
      pc.playSong();
    }
  },
};
