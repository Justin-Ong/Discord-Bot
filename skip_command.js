const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

var playlist = require("./play_command.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops playback and disconnects from VC"),
  async execute(interaction) {
    await interaction.reply("Stopping playback");
    let channel = interaction.member.voice.channel;
    if (playlist.length > 1) {
      
    }
    
  },
};
