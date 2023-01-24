const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops playback and disconnects from VC"),
  async execute(interaction) {
    await interaction.reply("Stopping playback");
    let channel = interaction.member.voice.channel;
    let connection = getVoiceConnection(channel.guild.id);
    if (connection) {
      connection.destroy();
    }
    pc.playlist = [];
    pc.playSong();
  },
};
