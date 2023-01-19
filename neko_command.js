const Booru = require("booru");
const {
  AttachmentBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const fs = require("fs");

const config = require("./config.json");
const neko_log = require("./neko_log.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("neko")
    .setDescription("Replies with a neko"),
  async execute(interaction) {
    await interaction.deferReply();
    await neko(interaction);
  },
};

function neko(interaction) {
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
      console.log("Sending neko: " + imageUrl + " at " + Date());

      const file = new AttachmentBuilder(imageUrl);
      const imageEmbed = new EmbedBuilder().setImage(imageUrl);

      interaction.editReply({ files: [file] });
    })
    .catch((err) => {
      if (err.name === "booruError") {
        console.log(err.message);
      } else {
        console.log(err);
        console.log("retrying...");
        neko(interaction);
      }
    });
}
