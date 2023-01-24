const { SlashCommandBuilder } = require("discord.js");
const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop all")
    .setDescription("Starts looping of all songs in queue"),
  async execute(interaction) {
    await interaction.reply("Now looping all songs");
    pc.isLoopingOne = false;
    pc.isLoopingAll = true;
  },
};
