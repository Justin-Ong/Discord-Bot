const { SlashCommandBuilder } = require("discord.js");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const ytsr = require("ytsr");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from a YouTube link")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("The song link to play")
        .setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString("input");
    await interaction.deferReply();
    //await musicPlayer(interaction, input);
  },
};

/*
function musicPlayer(interaction, msg) {
        if (!msg.member.voice.channel) {
            interaction.editReply("You need to join a voice channel first!");
        } else {
            if (this.currConnection === null) {
                this.getConnection(msg)
                    .then(() => this.parseInput(msg, song))
                    .catch(console.log);
            } else {
                this.parseInput(msg, song);
            }
        }
    }
*/
