const { SlashCommandBuilder } = require("discord.js");
const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Starts looping of all songs in queue")
    .addStringOption((option) =>
      option.setName("one").setDescription("Starts looping current song")
    )
    .addStringOption((option) =>
      option.setName("all").setDescription("Starts looping of all songs in queue")
    )
    .addStringOption((option) =>
      option.setName("off").setDescription("Stops looping of song(s)")
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "one") {
      await interaction.reply("Now looping all songs");
      pc.isLoopingOne = false;
      pc.isLoopingAll = true;
    }
  },
};
