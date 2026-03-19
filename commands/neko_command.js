const Booru = require("booru");
const { AttachmentBuilder, SlashCommandBuilder } = require("discord.js");

const config = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("neko")
    .setDescription("Replies with a neko"),
  async execute(interaction) {
    await interaction.deferReply();
    await neko(interaction);
  },
};

function neko(interaction, retries = 0) {
  if (retries >= 3) {
    return interaction.editReply("Failed to fetch image after multiple retries.");
  }
  let siteArray = config.sites;
  let site = siteArray[Math.floor(Math.random() * siteArray.length)];
  Booru.search(
    site,
    ["nekomimi", "rating:safe", "-comic", "-text", "-high_res"],
    {
      limit: 1,
      random: true,
    }
  )
    .then((posts) => {
      var imageUrl = posts[0].fileUrl;
      console.log("Sending neko: " + imageUrl + " at " + new Date());

      const file = new AttachmentBuilder(imageUrl);

      interaction.editReply({ files: [file] });
    })
    .catch((err) => {
      if (err.name === "booruError") {
        console.log(err.message);
      } else {
        console.log(err);
        console.log("retrying...");
        neko(interaction, retries + 1);
      }
    });
}
