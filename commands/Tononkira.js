const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const {
  search,
  searchByTitle,
  searchByArtist,
  searchByLyrics,
  getLyricsByUrl,
} = require('./lyricsModule'); // Assurez-vous que ce fichier contient le code importé

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tononkira',
  description: 'Rechercher des paroles de chansons en malgache',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(' ').trim();

    // Vérifier si l'utilisateur a fourni un type de recherche (titre, artiste, ou paroles)
    const searchType = query.startsWith('title:') ? 'title' :
                      query.startsWith('artist:') ? 'artist' :
                      query.startsWith('lyrics:') ? 'lyrics' : 'general';

    let results = [];
    let responseMessage = '';

    try {
      if (searchType === 'title') {
        const title = query.replace('title:', '').trim();
        results = await searchByTitle(title);
      } else if (searchType === 'artist') {
        const artist = query.replace('artist:', '').trim();
        results = await searchByArtist(artist);
      } else if (searchType === 'lyrics') {
        const lyrics = query.replace('lyrics:', '').trim();
        results = await searchByLyrics(lyrics);
      } else {
        results = await search(query);
      }

      // Vérifier si des résultats ont été trouvés
      if (results.length > 0) {
        // Limiter le nombre de résultats affichés
        const maxResults = 5;
        responseMessage = `Voici les résultats pour "${query}":\n\n`;

        results.slice(0, maxResults).forEach((item, index) => {
          responseMessage += `${index + 1}. *${item.title}* par *${item.artist}*\n`;
          responseMessage += `Lien: ${item.lyricsLink}\n\n`;
        });

        // Envoyer le message avec les résultats
        await sendMessage(senderId, { text: responseMessage }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Aucun résultat trouvé.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de paroles:', error);
      await sendMessage(senderId, { text: 'Erreur lors de la recherche. Veuillez réessayer plus tard.' }, pageAccessToken);
    }
  },
};
