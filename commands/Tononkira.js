const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tononkira',
  description: 'Recherche des paroles de chansons malgaches',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(' ').trim();

    if (!query) {
      await sendMessage(senderId, { text: 'Veuillez entrer un titre ou un artiste pour la recherche.' }, pageAccessToken);
      return;
    }

    try {
      // Effectuer une recherche de chansons sur tononkira
      const response = await axios.get(`https://tononkira.serasera.org/tononkira/hira/results`, {
        params: { 'filter[tadiavo]': query }
      });

      // Parser les résultats avec cheerio
      const cheerio = require('cheerio');
      const $ = cheerio.load(response.data);
      const results = [];
      $('table.list tbody tr').each((_, element) => {
        const title = $(element).find('td:nth-child(2)').text().trim();
        const artist = $(element).find('td:nth-child(3)').text().trim();
        const url = 'https://tononkira.serasera.org' + $(element).find('td:nth-child(2) a').attr('href');

        if (title && artist && url) {
          results.push({ title, artist, url });
        }
      });

      // Vérifier si des résultats ont été trouvés
      if (results.length === 0) {
        await sendMessage(senderId, { text: 'Aucune chanson trouvée pour cette recherche.' }, pageAccessToken);
        return;
      }

      // Envoyer les résultats au format numéroté
      let formattedMessage = 'Résultats de la recherche:\n';
      results.slice(0, 5).forEach((song, index) => {
        formattedMessage += `${index + 1}. ${song.title} - ${song.artist}\n`;
      });

      formattedMessage += '\nRépondez avec le numéro pour obtenir les paroles.';

      // Enregistrer les résultats pour un accès ultérieur
      global.tononkiraResults = results;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error.message);
      await sendMessage(senderId, { text: 'Erreur lors de la recherche. Veuillez réessayer plus tard.' }, pageAccessToken);
    }
  }
};
