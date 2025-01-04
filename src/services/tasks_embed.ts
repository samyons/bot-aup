import { EmbedBuilder } from 'discord.js';

/**
 * Crée un embed pour afficher les tâches d'un utilisateur.
 * 
 * @param {string} selectedName - Le nom du membre.
 * @param {string} selectedTeam - L'équipe sélectionnée (GPL ou COMM).
 * @param {RowObject[]} foundTasks - Liste des tâches trouvées.
 * @returns {EmbedBuilder} - Un embed Discord formaté.
 */
function createTaskEmbed(selectedName: string, selectedTeam: string, foundTasks: RowObject[]): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setColor(0x6d6f78) // Couleur bleue
        .setTitle(`Tâches ${selectedTeam} de **${selectedName}**`)
        .setDescription("Voici la liste de vos tâches.")
        .setThumbnail('https://i.ibb.co/wW2wBVz/472127252-918210523732495-7432582095665783489-n.png')
        .setTimestamp();

    // Fonction pour vérifier si une tâche est dépassée
    function isOverdue(task: RowObject): boolean {
        if (!task.Deadline) return false;
        const deadlineDate = new Date(task.Deadline.split('/').reverse().join('/')); // Format: dd/mm/yyyy
        return deadlineDate < new Date() && task.Statut === "En cours";
    }

    // Ajouter les tâches dans l'embed
    if (foundTasks.length > 0) {
        foundTasks.forEach(row => {
            const isTaskOverdue = isOverdue(row);

            // Ajouter le point d'exclamation pour les tâches dépassées
            const taskName = isTaskOverdue ? `❗️ **${row.Tâche}**` : (row.Statut === "En cours" ? `🔃  **${row.Tâche}**` :
                                                                 (row.Statut === "Terminée" ? `✅  **${row.Tâche}**` :
                                                                 `❌  **${row.Tâche}**`));

            const isEnRetard: string = isTaskOverdue ? " (en retard)" : "";
            embed.addFields({
                name: taskName,
                value: row.Deadline ? `*Deadline le ${row.Deadline}${isEnRetard}*` : '*Deadline pas encore défini*',
            });
        });
    } else {
        embed.setDescription("Aucune tâche trouvée.");
    }

    return embed;
}

export { createTaskEmbed };
