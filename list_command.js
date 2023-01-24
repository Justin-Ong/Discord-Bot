const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("Lists current playlist"),
  async execute(interaction) {
    await interaction.deferReply();
    await getList(interaction);
  },
};

async function getList(interaction) {
  if (!pc.playlist.length) {
    interaction.editReply("there are no songs in the queue!");
  } else {
    try {
      let result = "";
      for (let i = 0; i < 5; i++) {
        let song = pc.playlist[i];
        if (song === undefined) {
          break;
        }
        let info = await ytdl.getInfo(song);
        let song_title = info.videoDetails.title;
        let song_duration = new Date(info.videoDetails.lengthSeconds * 1000)
          .toISOString()
          .substr(11, 8);
        result +=
          "Song " +
          (i + 1) +
          ": " +
          song_title +
          ", Duration: " +
          song_duration +
          "\n";
      }
      result += pc.playlist.length + " songs in queue";
      interaction.editReply(result);
    } catch (err) {
      console.log(err);
      interaction.editReply("Sorry, an error occurred.");
    }
  }
}
