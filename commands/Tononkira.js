const { search, getLyricsByUrl } = require('tonokira'); // Assurez-vous d'avoir bien importé votre module
const { sendMessage } = require('../handles/sendMessage'); // Votre fonction d'envoi de message
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tononkira',
  description: 'Rechercher des chansons malagasy par titre, artiste ou paroles.',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(' ').trim();

    // Vérification si une requête a été fournie
    if (!query) {
      await sendMessage(senderId, { text: 'Veuillez fournir un titre, un artiste ou des paroles à rechercher.' }, pageAccessToken);
      return;
    }

    try {
      // Recherche des chansons en utilisant votre méthode de recherche
      const results = await search(query);

      // Si aucun résultat n'est trouvé
      if (results.length === 0) {
        await sendMessage(senderId, { text: `Aucun résultat trouvé pour : "${query}".` }, pageAccessToken);
        return;
      }

      // Formater la réponse avec les chansons trouvées
      let formattedMessage = '🎵 Résultats de recherche :\n';
      results.forEach((song, index) => {
        formattedMessage += `${index + 1}. *${song.title}* par *${song.artist}*\n`;
      });
      formattedMessage += '\nVeuillez répondre avec le numéro de la chanson pour voir les paroles.';

      // Envoyer la liste des résultats
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);

      // Attendre la réponse de l'utilisateur
      const handleUserResponse = async (userResponse) => {
        const selectedIndex = parseInt(userResponse.trim(), 10) - 1;

        // Vérifier si la réponse de l'utilisateur est valide
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= results.length) {
          await sendMessage(senderId, { text: 'Numéro invalide. Veuillez essayer à nouveau.' }, pageAccessToken);
          return;
        }

        // Récupérer les paroles de la chanson sélectionnée
        const selectedSong = results[selectedIndex];
        const lyrics = await getLyricsByUrl(selectedSong.lyricsLink);

        const lyricsMessage = `🎶 *${selectedSong.title}* par *${selectedSong.artist}*\n\n${lyrics}`;
        await sendMessage(senderId, { text: lyricsMessage }, pageAccessToken);
      };

      // Ajouter un listener pour recevoir la réponse utilisateur (simulateur d'événements pour votre bot)
      global.onUserResponse = handleUserResponse;

    } catch (error) {
      console.error('Erreur lors de la recherche des chansons:', error);
      await sendMessage(senderId, { text: 'Désolé, une erreur est survenue lors de la recherche.' }, pageAccessToken);
    }
  }
};
