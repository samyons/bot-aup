import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('drive')
    .setDescription('Lien du drive');

export async function execute(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: 'https://drive.google.com/drive/u/0/folders/1FKRVtuycUm9yfW-OMiVQttdqJhgjj9qP', ephemeral: true });
}