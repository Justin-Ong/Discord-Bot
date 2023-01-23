const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reboot")
    .setDescription("Reboots the bot"),
  async execute(interaction) {
    await interaction.reply("Rebooting...");
    let channel = interaction.member.voice.channel;
    let connection = getVoiceConnection(channel.guild.id);
    connection.destroy();
    process.exit();
  },
};
