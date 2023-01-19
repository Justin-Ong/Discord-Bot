const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reboot")
    .setDescription("Reboots the bot"),
  async execute(interaction) {
    await interaction.reply("Rebooting...");
    process.exit();
  },
};
