const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');

const { fetchSheetData } = require('../../services/fetch_sheet');
const { createTaskEmbed } = require('../../services/tasks_embed');
const { fetchAndSortTasks } = require('../../services/fetch_tasks');
const { handleTasksPagination } = require('../../services/handle_tasks_pagination');

const { RANGE_NOMS } = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('taches')
        .setDescription('Consulter la liste des tâches d\'un membre')
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


    async autocomplete(interaction) {
        let focusedValue = interaction.options.getFocused(true);
        let choices = [];

        // Récupérer les noms des membres depuis le sheet
        names = await fetchSheetData(RANGE_NOMS);
        names = names.map(row => row["Nom et prénom"]);

        // Filtrer les noms qui correspondent à la valeur recherchée
        choices = names.filter(name => {
            const [firstName, lastName] = name.split(' ');
            const reversedName = `${lastName} ${firstName}`;

            // Vérifie si le prénom ou nom correspond à la valeur recherchée, dans un ordre ou dans l'autre
            // On prend les 25 premiers résultats car Discord ne permet pas d'afficher plus de 25 résultats
            return name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) ||
                   reversedName.toLowerCase().startsWith(focusedValue.value.toLowerCase());
        }).slice(0, 25); 

        await interaction.respond(
            choices.map(choice => ({ name: choice, value: choice })),
          );
    },
    async execute(interaction) {
        const selectedName = interaction.options.getString('nom'); // Nom sélectionné
        const selectedTeam = interaction.options.getString('equipe'); // Équipe sélectionnée

        const tasks = await fetchAndSortTasks(selectedName, selectedTeam);

        if (!tasks || tasks.length === 0) {
            return interaction.reply({ content: `Aucune tâche trouvée pour ${selectedName} dans l'équipe ${selectedTeam}.`, ephemeral: true });
        }

        // Gérer la pagination
        await handleTasksPagination(interaction, tasks, selectedName, selectedTeam);
    },
};