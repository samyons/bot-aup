const { fetchSheetData } = require('@services/fetch_sheet');
const { RANGE_TACHES_GPL, RANGE_TACHES_COMM } = {
    RANGE_TACHES_GPL: process.env.RANGE_TACHES_GPL,
    RANGE_TACHES_COMM: process.env.RANGE_TACHES_COMM,
}

/**
 * Récupère et trie les tâches d'un membre donné pour une équipe.
 * @param {string} memberName - Le nom du membre.
 * @param {string} team - Le nom de l'équipe (GPL ou COMM).
 * @returns {Promise<Array>} - Liste triée des tâches.
 */
async function fetchAndSortTasks(memberName, team) {
    const range = team === 'GPL' ? RANGE_TACHES_GPL : RANGE_TACHES_COMM;
    const allTasks = await fetchSheetData(range);

    console.log(allTasks);
    // Filtrer les tâches pour le membre donné
    const memberTasks = allTasks.filter(row => 
        row["Tâche collective ?"] == "TRUE" || (row["Assigné à"] &&  row["Assigné à"].toLowerCase().includes(memberName.toLowerCase()))
    );

    // Trier les tâches selon les critères donnés
    const sortedTasks = memberTasks.sort((a, b) => {

        function parseDate(dateString) {
            const [day, month, year] = dateString.split('/').map(Number);
            return new Date(year, month - 1, day); // Les mois commencent à 0 en JS
        }

        const statusA = a["Statut"]; // Colonne "Statut"
        const statusB = b["Statut"];
        const deadlineA = a["Deadline"] ? parseDate(a["Deadline"]) : null; // Colonne "Deadline"
        const deadlineB = b["Deadline"] ? parseDate(b["Deadline"]) : null;

        // 1. Tâches pas encore terminées en premier
        if (statusA === "En cours" && statusB !== "En cours") return -1;
        if (statusA !== "En cours" && statusB === "En cours") return 1;
        if (statusA !== "Terminée" && statusB === "Terminée") return -1;
        if (statusA === "Terminée" && statusB !== "Terminée") return 1;

        // 2. Parmi les non terminées, celles avec deadline définie en premier
        if (!deadlineA && deadlineB) return 1;
        if (deadlineA && !deadlineB) return -1;

   
        // 3. Si les deux ont une deadline, trier par la date
        if (deadlineA && deadlineB) {
            console.log(deadlineA, deadlineB);
            return deadlineA - deadlineB;
        }

        // Sinon, l'ordre reste inchangé
        return 0;
    });

    return sortedTasks;
}

module.exports = { fetchAndSortTasks };