const { SlashCommandBuilder } = require("discord.js");
const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Starts looping of all songs in queue")
    .addStringOption((option) =>
      option
        .setName("one")
        .setDescription("Starts looping current song")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("all")
        .setDescription("Starts looping of all songs in queue")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("off")
        .setDescription("Stops looping of song(s)")
        .setRequired(false)
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "one") {
      await interaction.reply("Now looping current song");
      pc.isLoopingOne = true;
      pc.isLoopingAll = false;
    } else if (interaction.options.getSubcommand() === "all") {
      await interaction.reply("Now looping all songs");
      pc.isLoopingOne = false;
      pc.isLoopingAll = true;
    } else if (interaction.options.getSubcommand() === "off") {
      await interaction.reply("Stopping looping of song(s)");
      pc.isLoopingOne = false;
      pc.isLoopingAll = false;
    }
  },
};
