const { SlashCommandBuilder } = require("discord.js");
const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Handles looping of songs in the queue")
    .addStringOption((option) =>
      option
        .setName("option")
        .setDescription("loop command option")
        .setRequired(true)
        .addChoices(
          { name: "one", value: "one" },
          { name: "all", value: "all" },
          { name: "off", value: "off" }
        )
    ),
  async execute(interaction) {
    const option = interaction.options.getString("option");
    if (option === "one") {
      await interaction.reply("Now looping current song");
      pc.setLoopOne();
    } else if (option === "all") {
      await interaction.reply("Now looping all songs");
      pc.setLoopAll();
    } else if (option === "off") {
      await interaction.reply("Stopping looping of song(s)");
      pc.setLoopOff();
    }
  },
};
