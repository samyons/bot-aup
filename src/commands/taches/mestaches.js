const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');

const { fetchSheetData } = require('../../services/fetch_sheet');
const { createTaskEmbed } = require('../../services/tasks_embed');
const { fetchAndSortTasks } = require('../../services/fetch_tasks');
const { handleTasksPagination } = require('../../services/handle_tasks_pagination');

const { RANGE_NOMS } = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mestaches')
        .setDescription('Consulter la liste de vos tâches'),

    async execute(interaction) {
        const userId = interaction.user.username; // Identifiant Discord de la personne qui a fait la commande
    

        // Récupérer les données depuis le Google Sheet
        const names = await fetchSheetData(RANGE_NOMS);

        // Trouver le nom associé à l'ID Discord de l'utilisateur
        const user = names.find(row => row["Discord"] === userId);

        if (!user) {
            return interaction.reply({ content: "Vous ne faîtes pas partie du projet AUP. Si vous pensez que c'est une erreur, contactez un coordinateur.", ephemeral: true });
        }

        const userName = user["Nom et prénom"]; // Nom et prénom de l'utilisateur
        const userTeam = user["Équipe"]; // Équipe de l'utilisateur

        // Récupérer les tâches de cet utilisateur pour l'équipe sélectionnée
        const tasks = await fetchAndSortTasks(userName, userTeam);

        if (!tasks || tasks.length === 0) {
            return interaction.reply({ content: `Aucune tâche trouvée pour ${userName} dans l'équipe ${userTeam}.`, ephemeral: true });
        }

        // Gérer la pagination des tâches
        await handleTasksPagination(interaction, tasks, userName, userTeam);
    },
};