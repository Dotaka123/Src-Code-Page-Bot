const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const rapidApiKey = 'bf6b729bbdmshb9d8e92ca0fc1cep191fbfjsn71acd0cb1e97';

let userState = {};

module.exports = {
  name: 'tononkira',
  description: 'Rechercher des paroles de chanson Malagasy',
  author: 'Tata',

  async execute(senderId, args) {
    const input = args.join(' ').trim();

    if (!userState[senderId]) {
      // Étape 1 : Demander le titre si seul l'artiste est fourni
      if (input) {
        userState[senderId] = { artist: input };
        await sendMessage(senderId, { text: `🎤 Artiste : *${input}*\nVeuillez maintenant entrer le titre de la chanson avec :\n*tononkira [titre]*` });
      } else {
        await sendMessage(senderId, { text: `❌ Veuillez entrer un artiste.\nExemple : tononkira Hosana` });
      }
    } else if (!userState[senderId].title) {
      // Étape 2 : L'utilisateur fournit le titre
      userState[senderId].title = input;

      try {
        // Construire l'URL pour l'API en fonction de l'artiste et du titre
        const searchUrl = `https://tononkira.serasera.org/hira/${encodeURIComponent(userState[senderId].artist)}/${encodeURIComponent(input)}`;
        const encodedParams = new URLSearchParams();
        encodedParams.set('url', searchUrl);

        const options = {
          method: 'POST',
          url: 'https://tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com/infos_two_hira',
          headers: {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': 'tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: encodedParams,
        };

        const response = await axios.request(options);
        const data = response.data;

        if (data && data.lyrics) {
          const lyrics = data.lyrics.join('\n');
          const message = `🎶 *${data.title}* - *${data.artist}* 🎶\n\n${lyrics}`;
          await sendMessage(senderId, { text: message });
        } else {
          await sendMessage(senderId, { text: `❌ Aucune parole trouvée pour *${userState[senderId].artist}* - *${input}*.` });
        }
      } catch (error) {
        console.error('Erreur API :', error);
        await sendMessage(senderId, { text: `❌ Une erreur s'est produite lors de la recherche des paroles.` });
      } finally {
        // Réinitialiser l'état de l'utilisateur
        delete userState[senderId];
      }
    }
  },
};
