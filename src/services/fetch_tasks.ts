import { fetchSheetData } from './fetch_sheet';
import { RANGE_TACHES_GPL, RANGE_TACHES_COMM } from '../../config.json';

/**
 * Récupère et trie les tâches d'un membre donné pour une équipe.
 * @param {string} memberName - Le nom du membre.
 * @param {string} team - Le nom de l'équipe (GPL ou COMM).
 * @returns {Promise<Array>} - Liste triée des tâches.
 */
async function fetchAndSortTasks(memberName: string, team: string): Promise<RowObject[]> {
    const range = team === 'GPL' ? RANGE_TACHES_GPL : RANGE_TACHES_COMM;
    const allTasks = await fetchSheetData(range);

    // Filtrer les tâches pour le membre donné
    const memberTasks = allTasks.filter(row => 
        row["Tâche collective ?"] === "TRUE" || (row["Assigné à"] && row["Assigné à"].toLowerCase().includes(memberName.toLowerCase()))
    );

    // Fonction pour analyser la date au format 'jj/mm/aaaa'
    function parseDate(dateString: string): Date | null {
        const [day, month, year] = dateString.split('/').map(Number);
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day);
    }

    // Vérifie si la tâche est en retard et non terminée
    function isOverdue(task: RowObject): boolean {
        if (!task.Deadline) return false;
        const deadlineDate = new Date(task.Deadline.split('/').reverse().join('/')); // Format: dd/mm/yyyy
        return deadlineDate < new Date() && task.Statut === "En cour";
    }

    // Trier les tâches selon les critères donnés
    const sortedTasks = memberTasks.sort((a, b) => {
        const overdueA = isOverdue(a);
        const overdueB = isOverdue(b);

        // 1. Placer les tâches en retard en premier
        if (overdueA && !overdueB) return -1;
        if (!overdueA && overdueB) return 1;

        const statusA = a["Statut"]; // Colonne "Statut"
        const statusB = b["Statut"];
        const deadlineA = a["Deadline"] ? parseDate(a["Deadline"]) : null; // Colonne "Deadline"
        const deadlineB = b["Deadline"] ? parseDate(b["Deadline"]) : null;

        // 2. Tâches pas encore terminées en premier
        if (statusA === "En cours" && statusB !== "En cours") return -1;
        if (statusA !== "En cours" && statusB === "En cours") return 1;
        if (statusA !== "Terminée" && statusB === "Terminée") return -1;
        if (statusA === "Terminée" && statusB !== "Terminée") return 1;

        // 3. Parmi les non terminées, celles avec deadline définie en premier
        if (!deadlineA && deadlineB) return 1;
        if (deadlineA && !deadlineB) return -1;

        // 4. Si les deux ont une deadline, trier par la date
        if (deadlineA && deadlineB) {
            return deadlineA.getTime() - deadlineB.getTime();
        }

        // Sinon, l'ordre reste inchangé
        return 0;
    });

    return sortedTasks;
}

export { fetchAndSortTasks };
