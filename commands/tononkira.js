const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage'); // Fonction pour envoyer des messages
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8'); // Charger le token pour Messenger

module.exports = {
  name: 'tononkira',
  description: 'Rechercher les paroles d\'une chanson malgache',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (args.length === 0) {
      await sendMessage(senderId, { text: 'Veuillez fournir le lien de la chanson. Exemple : !lyrics https://tononkira.serasera.org/hira/<artiste>/<titre>' }, pageAccessToken);
      return;
    }

    const songUrl = args[0]; // URL de la chanson fournie par l'utilisateur
    const encodedParams = new URLSearchParams();
    encodedParams.set('url', songUrl);

    const options = {
      method: 'POST',
      url: 'https://tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com/infos_two_hira',
      headers: {
        'x-rapidapi-key': 'bf6b729bbdmshb9d8e92ca0fc1cep191fbfjsn71acd0cb1e97',
        'x-rapidapi-host': 'tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: encodedParams,
    };

    try {
      const response = await axios.request(options);
      const { title, artist, lyrics } = response.data;

      if (!title || !lyrics) {
        await sendMessage(senderId, { text: 'Aucune parole trouvée pour cette chanson.' }, pageAccessToken);
        return;
      }

      // Formatage du message
      const formattedLyrics = `🎶 *${title}* - *${artist}* 🎶\n\n${lyrics.join('\n')}`;
      await sendMessage(senderId, { text: formattedLyrics }, pageAccessToken);
    } catch (error) {
      console.error('Erreur lors de la requête API:', error);
      await sendMessage(senderId, { text: 'Une erreur s\'est produite lors de la recherche des paroles.' }, pageAccessToken);
    }
  },
};
