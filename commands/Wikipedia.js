const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'wikipedia',
  description: 'Recherche des informations sur Wikipedia',
  author: 'Tata',
  usage:'wikipedia [your message]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(' ').trim();

    if (!query) {
      await sendMessage(senderId, { text: 'Veuillez entrer un terme à rechercher sur Wikipedia.' }, pageAccessToken);
      return;
    }

    try {
      sendMessage(senderId, { text: 'Recherche de resultat en cours...' }, pageAccessToken);
      // Effectuer une recherche sur Wikipedia via l'API
      const response = await axios.get('https://fr.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          list: 'search',
          srsearch: query,
          format: 'json',
          utf8: 1,
          srlimit: 1, // Limite à 1 résultat
        }
      });

      const results = response.data.query.search;
      
      // Vérifier si des résultats ont été trouvés
      if (!results || results.length === 0) {
        await sendMessage(senderId, { text: `Aucun résultat trouvé pour "${query}" sur Wikipedia.` }, pageAccessToken);
        return;
      }

      // Obtenir le titre du premier résultat et envoyer un résumé
      const title = results[0].title;

      // Requête pour obtenir le résumé du titre
      const summaryResponse = await axios.get('https://fr.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title));
      
      const summary = summaryResponse.data;
      
      let formattedMessage = `📝 Résumé Wikipedia :\n\n`;
      formattedMessage += `*Titre* : ${summary.title}\n\n`;
      formattedMessage += `${summary.extract}\n`;
      
      // Ajouter un lien vers l'article complet
      formattedMessage += `\n[Lire plus](https://fr.wikipedia.org/wiki/${encodeURIComponent(title)})`;

      // Envoyer le message formaté
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);

    } catch (error) {
      console.error('Erreur lors de la recherche Wikipedia:', error.message);
      await sendMessage(senderId, { text: 'Erreur lors de la recherche sur Wikipedia. Veuillez réessayer plus tard.' }, pageAccessToken);
    }
  }
};
