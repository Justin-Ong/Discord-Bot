const { SlashCommandBuilder } = require("discord.js");
const play = require("play-dl");

const pc = require("./play_command");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("Lists the first five songs in the current playlist"),
  async execute(interaction) {
    await interaction.deferReply();
    await getList(interaction);
  },
};

async function getList(interaction) {
  if (!pc.playlist.length) {
    interaction.editReply("There are no songs in the queue!");
  } else {
    try {
      let result = "";
      for (let i = 0; i < 5; i++) {
        let song = pc.playlist[i];
        if (song === undefined) {
          break;
        }
        let info = await play.video_info(song);
        let song_title = info.video_details.title;
        let song_duration = new Date(info.video_details.durationInSec * 1000)
          .toISOString()
          .substring(11, 19);
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
