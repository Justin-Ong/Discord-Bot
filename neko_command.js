const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('neko')
		.setDescription('Replies with a neko'),
	async execute(interaction) {
		await interaction.reply('neko');
	},
};
