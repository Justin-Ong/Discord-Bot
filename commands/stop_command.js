const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops playback and disconnects from VC"),
  async execute(interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) {
      return interaction.reply({ content: "You need to be in a voice channel!", ephemeral: true });
    }
    await interaction.reply("Stopping playback");
    const connection = getVoiceConnection(channel.guild.id);
    if (connection) {
      connection.destroy();
    }
    pc.playlist.length = 0;
    pc.playSong();
  },
};
