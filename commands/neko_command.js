const Booru = require("booru");
const { AttachmentBuilder, SlashCommandBuilder } = require("discord.js");

const config = require("../config.json");
const tags = ["nekomimi", "rating:safe", "-comic", "-text", "-high_res"];
const pageSize = 100;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("neko")
    .setDescription("Replies with a neko"),
  async execute(interaction) {
    await interaction.deferReply();
    await neko(interaction);
  },
};

async function neko(interaction, retries = 0) {
  if (retries >= 3) {
    return interaction.editReply("Failed to fetch image after multiple retries.");
  }
  const siteArray = config.sites;
  const site = siteArray[Math.floor(Math.random() * siteArray.length)];
  try {
    const booru = Booru.forSite(site);
    let post;
    if (booru.domain === "safebooru.org") {
      const count = await booru.getPostCount(tags);
      if (!Number.isInteger(count) || count <= 0) {
        throw new Error("Safebooru did not return a positive matching post count.");
      }

      // Choose a post position so a partial final page has the correct weight.
      const position = Math.floor(Math.random() * count);
      const posts = await booru.search(tags, {
        limit: pageSize,
        page: Math.floor(position / pageSize),
        random: false,
        // Preserve positions even when an image is unavailable.
        showUnavailable: true,
      });
      post = posts[position % pageSize];
    } else {
      const posts = await booru.search(tags, { limit: 1, random: true });
      post = posts[0];
    }

    if (!post || !post.available || !post.fileUrl) {
      throw new Error("The selected image is unavailable.");
    }

    const imageUrl = post.fileUrl;
    const file = new AttachmentBuilder(imageUrl);
    await interaction.editReply({ files: [file] });
    console.log("Sending neko: " + imageUrl + " at " + new Date());
  } catch (err) {
    if (err.name === "BooruError") {
      console.log("Booru error when trying to send from " + site + ":", err.message);
    } else {
      console.log(err);
      console.log("retrying...");
    }
    return neko(interaction, retries + 1);
  }
}
