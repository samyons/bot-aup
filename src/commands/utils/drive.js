const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drive')
		.setDescription('Lien du drive'),
	async execute(interaction) {
		await interaction.reply({content: 'https://drive.google.com/drive/u/0/folders/1FKRVtuycUm9yfW-OMiVQttdqJhgjj9qP',  ephemeral: true });
	},
};