const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'movie',
  description: 'Rechercher des informations sur un film',
  author: 'Tata',
  usage: 'movie [nom du film]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(' ').trim();
    if (!query) {
      return sendMessage(senderId, { text: 'Veuillez fournir un nom de film pour la recherche.' }, pageAccessToken);
    }

    const apiUrl = `https://api.popcat.xyz/imdb?q=${encodeURIComponent(query)}`;

    try {
      await sendMessage(senderId,{text:'🕵🏻...'},pageAccessToken);
      const response = await axios.get(apiUrl);
      const movie = response.data;

      // Format message
      const formattedMessage = `
🎬 *${movie.title}* (${movie.year})
📅 Date de sortie: ${new Date(movie.released).toLocaleDateString()}
🎭 Genres: ${movie.genres}
🎞️ Durée: ${movie.runtime}
🍿 Note: ${movie.rating}/10
🌍 Langues: ${movie.languages}
🎥 Réalisateur: ${movie.director}
✍️ Scénario: ${movie.writer}
👥 Acteurs: ${movie.actors}
🏆 Récompenses: ${movie.awards}
📜 Synopsis: ${movie.plot}
🔗 [IMDB](${movie.imdburl})
      `;

      // Ajouter les ratings des sources
      const ratings = movie.ratings.map(rating => `${rating.source}: ${rating.value}`).join('\n');
      const message = `${formattedMessage}\n\n🍅 Critiques:\n${ratings}`;

      await sendMessage(senderId, { text: message }, pageAccessToken);

      // Envoyer l'image de l'affiche
      if (movie.poster) {
        await sendMessage(senderId, { attachment: { type: 'image', payload: { url: movie.poster, is_reusable: true } } }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Impossible de récupérer les informations du film.' }, pageAccessToken);
    }
  }
};
