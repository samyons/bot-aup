import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('bo')
    .setDescription('Lien du drive coordination');

export async function execute(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: 'https://drive.google.com/drive/u/0/folders/0ALv5HrUOSNbWUk9PVA', ephemeral: true });
}