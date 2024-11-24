const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'anime',
  description: 'Rechercher des informations sur un anime',
  author: 'Tata',
  usage:'anime [the name of the anime]',

  async execute(senderId, args) {
    const query = args.join(' ').trim();
    if (!query) {
      return sendMessage(senderId, { text: "Veuillez fournir le titre de l'anime. Exemple : anime Naruto" });
    }

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/mal?title=${encodeURIComponent(query)}`);
      const data = response.data;

      if (!data.title) {
        return sendMessage(senderId, { text: "Désolé, aucune information trouvée pour cet anime." });
      }

      const formattedMessage = `
🎬 **${data.title}** (${data.japanese})
👤 **Auteur**: ${data.author || 'Inconnu'}
🏷️ **Type**: ${data.type || 'Non spécifié'} | **Statut**: ${data.status || 'Non spécifié'}
📅 **Diffusé**: ${data.aired || 'Inconnu'} (${data.premiered || ''})
📺 **Heure de diffusion**: ${data.broadcast || 'Inconnu'}
🏭 **Studios**: ${data.studios || 'Non spécifié'}
⭐ **Score**: ${data.score || 'Non noté'} (${data.scoreStats || ''})
👥 **Popularité**: ${data.popularity || 'Non spécifié'}
🕒 **Durée**: ${data.duration || 'Non spécifiée'}
📖 **Genres**: ${data.genres || 'Non spécifiés'}
🔗 [Voir plus d'informations](${data.url || '#'})

📖 **Description**: 
${data.description || 'Pas de description disponible.'}
      `.trim();

      await sendMessage(senderId, { 
        text: formattedMessage, 
        attachment: {
          type: 'image',
          payload: { url: data.picture }
        } 
      });
    } catch (error) {
      console.error('Erreur API:', error);
      await sendMessage(senderId, { text: "Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard." });
    }
  }
};
