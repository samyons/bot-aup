const { EmbedBuilder } = require('discord.js');

/**
 * Crée un embed pour afficher les tâches d'un utilisateur.
 * 
 * @param {string} selectedName - Le nom du membre.
 * @param {string} selectedTeam - L'équipe sélectionnée (GPL ou COMM).
 * @param {Array} foundTasks - Liste des tâches trouvées.
 * @returns {EmbedBuilder} - Un embed Discord formaté.
 */
function createTaskEmbed(selectedName, selectedTeam, foundTasks) {
    const embed = new EmbedBuilder()
        .setColor(0x6d6f78) // Couleur bleue
        .setTitle(`Tâches ${selectedTeam} de **${selectedName}**`)
        .setDescription("Voici la liste de vos tâches. Blabla on peut mettre des trucs.")
        .setThumbnail('https://i.ibb.co/wW2wBVz/472127252-918210523732495-7432582095665783489-n.png')
        .setTimestamp();

    // Ajouter les tâches dans l'embed
    if (foundTasks.length > 0) {
        foundTasks.forEach(row => {
            embed.addFields({
                name: row["Statut"] === "En cours" ? `🔃  **${row["Tâche"]}**` :
                      row["Statut"] === "Terminée" ? `✅  **${row["Tâche"]}**` :
                      `❌  **${row["Tâche"]}**`,
                value: row["Deadline"] ? `*Deadline le ${row["Deadline"]}*` : '*Deadline pas encore défini*',
            });
        });
    } else {
        embed.setDescription("Aucune tâche trouvée.");
    }

    return embed;
}

module.exports = { createTaskEmbed };
