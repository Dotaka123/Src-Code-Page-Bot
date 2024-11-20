const { search, getLyricsByUrl } = require('tonokira');

module.exports = {
  name: 'tononkira',
  description: 'Recherche une chanson malagasy et affiche les paroles',
  author: 'Tata',

  async execute(senderId, args) {
    const input = args.join(' ').trim();

    if (!input) {
      return sendMessage(senderId, { text: 'Merci de fournir un titre de chanson ou un artiste.' });
    }

    try {
      // Recherche de la chanson
      const result = await search(input);

      if (result.length === 0) {
        return sendMessage(senderId, { text: `Aucun résultat trouvé pour : ${input}` });
      }

      // Liste les résultats et demande à l'utilisateur de choisir un numéro
      let responseMessage = 'Voici les résultats trouvés, choisissez un numéro pour voir les paroles :\n';
      result.slice(0, 3).forEach((song, index) => {
        responseMessage += `\n${index + 1}. ${song.title} - ${song.artist}`;
      });

      // Envoie la liste avec les instructions de sélection
      await sendMessage(senderId, { text: responseMessage });

      // Sauvegarde les résultats pour pouvoir récupérer les paroles lors du choix
      await saveSongChoices(senderId, result);

    } catch (error) {
      console.error('Erreur lors de la recherche de fihirana :', error);
      sendMessage(senderId, { text: 'Désolé, une erreur est survenue lors de la recherche des chansons.' });
    }
  },

  // Fonction pour gérer la réponse de l'utilisateur
  async handleUserResponse(senderId, response) {
    const songIndex = parseInt(response.split(' ')[1], 10) - 1;

    // Récupérer les chansons sauvegardées et sélectionner celle que l'utilisateur a choisie
    const songs = await getSavedSongChoices(senderId);
    const song = songs[songIndex];

    if (song) {
      try {
        // Récupérer les paroles de la chanson
        const lyrics = await getLyricsByUrl(song.lyricsLink);
        const lyricsPreview = lyrics.substring(0, 200);  // Afficher un extrait

        sendMessage(senderId, {
          text: `Voici les paroles de "${song.title}" de ${song.artist} :\n\n${lyricsPreview}...`,
        });

        // Demander si l'utilisateur veut voir plus de paroles
        sendMessage(senderId, {
          text: 'Voulez-vous voir plus de paroles ? Répondez avec "Tononkira select <numéro>" pour voir plus.',
        });
      } catch (error) {
        sendMessage(senderId, {
          text: 'Désolé, une erreur est survenue lors de l\'affichage des paroles.',
        });
      }
    } else {
      sendMessage(senderId, { text: 'Choix invalide, veuillez réessayer avec un numéro valide.' });
    }
  },
};

// Fonction pour sauvegarder les chansons choisies par l'utilisateur (exemple)
async function saveSongChoices(senderId, songs) {
  // Sauvegarder les chansons dans la base de données ou dans un cache temporaire
  // Utilise une méthode de stockage (exemple : un fichier ou une base de données)
  // Tu peux aussi utiliser une simple variable mémoire en fonction du nombre d'utilisateurs
}

// Fonction pour récupérer les chansons sauvegardées
async function getSavedSongChoices(senderId) {
  // Récupère les chansons sauvegardées pour l'utilisateur
  // Utilise la même méthode de stockage pour accéder à la liste des chansons
  return [];  // Retourne les chansons sauvegardées
  }
