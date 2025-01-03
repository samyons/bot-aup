import { SlashCommandBuilder, CommandInteraction, AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { fetchSheetData } from '../../services/fetch_sheet';
import { fetchAndSortTasks } from '../../services/fetch_tasks';
import { handleTasksPagination } from '../../services/handle_tasks_pagination';

import { RANGE_NOMS } from '../../../config.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('taches')
    .setDescription("Consulter la liste des tâches d'un membre")
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Nom du membre pour lequel vous souhaitez consulter les tâches')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('equipe')
        .setDescription('Quelle équipe ?')
        .setRequired(true)
        .addChoices(
          { name: 'GPL', value: 'GPL' },
          { name: 'COMM', value: 'COMM' },
        )),

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused(true);
    let choices: string[] = [];

    // Récupérer les noms des membres depuis le sheet
    const names = await fetchSheetData(RANGE_NOMS);
    const nameList = names.map(row => row["Nom et prénom"]);

    // Filtrer les noms qui correspondent à la valeur recherchée
    choices = nameList.filter(name => {
      const [firstName, lastName] = name.split(' ');
      const reversedName = `${lastName} ${firstName}`;

      // Vérifie si le prénom ou nom correspond à la valeur recherchée, dans un ordre ou dans l'autre
      return name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) ||
        reversedName.toLowerCase().startsWith(focusedValue.value.toLowerCase());
    }).slice(0, 25);

    await interaction.respond(
      choices.map(choice => ({ name: choice, value: choice })),
    );
  },

  async execute(interaction: ChatInputCommandInteraction) {
    interaction.deferReply({ ephemeral: true });

    const selectedName = interaction.options.getString('nom')!; // Nom sélectionné
    const selectedTeam = interaction.options.getString('equipe')!; // Équipe sélectionnée

    const tasks = await fetchAndSortTasks(selectedName, selectedTeam);

    if (!tasks || tasks.length === 0) {
      return interaction.editReply({ content: `Aucune tâche trouvée pour ${selectedName} dans l'équipe ${selectedTeam}.`});
    }

    // Gérer la pagination
    await handleTasksPagination(interaction, tasks, selectedName, selectedTeam);
  },
};
