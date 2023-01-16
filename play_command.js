const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song'),
	async execute(interaction) {
		await interaction.reply('Play song');
	},
};
