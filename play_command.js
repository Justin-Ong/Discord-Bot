const { SlashCommandBuilder } = require('discord.js');
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const ytsr = require("ytsr");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song from a YouTube link')
  	.addStringOption(option =>
		option.setName('input')
			.setDescription('The song link to play')),
	async execute(interaction) {
		await interaction.reply('Play song');
	},
};
