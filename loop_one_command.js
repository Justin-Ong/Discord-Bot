const { SlashCommandBuilder } = require("discord.js");
const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop one")
    .setDescription("Starts looping current song"),
  async execute(interaction) {
    await interaction.reply("Now looping current song");
    pc.isLoopingOne = true;
    pc.isLoopingAll = false;
  },
};
