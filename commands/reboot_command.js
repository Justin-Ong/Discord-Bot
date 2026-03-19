const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const { client } = require("../server");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reboot")
    .setDescription("Reboots the bot"),
  async execute(interaction) {
    await interaction.reply("Rebooting...");
    const channel = interaction.member.voice.channel;
    if (channel) {
      const connection = getVoiceConnection(channel.guild.id);
      if (connection) {
        connection.destroy();
      }
    }
    client.destroy();
    process.exit(0);
  },
};
