const { SlashCommandBuilder } = require("discord.js");
const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop stop")
    .setDescription("Stops looping of song(s)"),
  async execute(interaction) {
    await interaction.reply("Stopping looping of song(s)");
    pc.isLoopingOne = false;
    pc.isLoopingAll = false;
  },
};
