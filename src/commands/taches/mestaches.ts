import { SlashCommandBuilder, Interaction, CommandInteraction, ChatInputCommandInteraction } from 'discord.js';
import { fetchSheetData } from '../../services/fetch_sheet';
import { fetchAndSortTasks } from '../../services/fetch_tasks';
import { handleTasksPagination } from '../../services/handle_tasks_pagination';
import { RANGE_NOMS } from '../../../config.json';

// Define the structure of a user row in the sheet

export const data = new SlashCommandBuilder()
  .setName('mestaches')
  .setDescription('Consulter la liste de vos tâches');

export async function execute(interaction: ChatInputCommandInteraction) {
  interaction.deferReply({ ephemeral: true });

  const userId = interaction.user.username; // Identifiant Discord de la personne qui a fait la commande
  
  // Récupérer les données depuis le Google Sheet
  const names = await fetchSheetData(RANGE_NOMS);

  // Trouver le nom associé à l'ID Discord de l'utilisateur
  const user = names.find(row => row.Discord === userId);

  if (!user) {
    return interaction.editReply({
      content: "Vous ne faîtes pas partie du projet AUP. Si vous pensez que c'est une erreur, contactez un coordinateur.",
    });
  }

  const userName = user["Nom et prénom"]; // Nom et prénom de l'utilisateur
  const userTeam = user["Équipe"]; // Équipe de l'utilisateur

  // Récupérer les tâches de cet utilisateur pour l'équipe sélectionnée
  const tasks = await fetchAndSortTasks(userName, userTeam);

  if (!tasks || tasks.length === 0) {
    return interaction.editReply({
      content: `Aucune tâche trouvée pour ${userName} dans l'équipe ${userTeam}.`,
    });
  }

  // Gérer la pagination des tâches
  await handleTasksPagination(interaction, tasks, userName, userTeam);
}
