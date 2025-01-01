const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');


const { createTaskEmbed } = require('./tasks_embed');


/**
 * Gère la pagination des tâches et l'interaction avec l'utilisateur via des boutons de navigation.
 * @param {Interaction} interaction - L'interaction Discord qui a déclenché la commande.
 * @param {Array} tasks - La liste des tâches à afficher.
 * @param {string} memberName - Le nom du membre pour lequel les tâches sont affichées.
 * @param {string} memberTeam - Le nom de l'équipe (GPL ou COMM).
 * @returns {Promise<void>} - La fonction n'a pas de retour, elle modifie le message dans Discord avec les tâches paginées.
 */

async function handleTasksPagination(interaction, tasks, memberName, memberTeam) {
    const itemsPerPage = 5;
    let currentPage = 0;

    const updateEmbed = (page) => {
        const startIndex = page * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const tasksForPage = tasks.slice(startIndex, endIndex);
        return createTaskEmbed(memberName, memberTeam, tasksForPage)
            .setFooter({ text: `Page ${page + 1} sur ${Math.ceil(tasks.length / itemsPerPage)}` });
    };

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('next')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('▶️')
                .setDisabled(tasks.length <= itemsPerPage),
        );

    // Envoyer le premier embed
    const message = await interaction.reply({
        embeds: [updateEmbed(currentPage)],
        components: [row],
        ephemeral: true,
    });

    const collector = message.createMessageComponentCollector({ time: 180000 }); // 3 minutes

    collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
            await btnInteraction.reply({ content: "Vous ne pouvez pas interagir avec ces boutons.", ephemeral: true });
            return;
        }

        // Changer la page selon le bouton cliqué
        if (btnInteraction.customId === 'previous') {
            currentPage = Math.max(currentPage - 1, 0);
        } else if (btnInteraction.customId === 'next') {
            currentPage = Math.min(currentPage + 1, Math.ceil(tasks.length / itemsPerPage) - 1);
        }

        // Mettre à jour l'embed et les boutons
        const updatedEmbed = updateEmbed(currentPage);
        row.components[0].setDisabled(currentPage === 0);
        row.components[1].setDisabled(currentPage === Math.ceil(tasks.length / itemsPerPage) - 1);

        await btnInteraction.update({ embeds: [updatedEmbed], components: [row] });
    });

    collector.on('end', () => {
        // Désactiver les boutons après expiration du collecteur
        row.components.forEach(component => component.setDisabled(true));
        message.edit({ components: [row] });
    });
}

module.exports = { handleTasksPagination };