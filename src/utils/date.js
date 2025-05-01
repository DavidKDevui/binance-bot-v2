const dateTools = {

    //Récupérer la date actuelle, au format 10:00:00 - Mardi 27 avril 2025
    getCurrentDate: () => {
        const date = new Date();
        return date.toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

module.exports = dateTools;




