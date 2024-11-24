const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'senku',
  description: 'Poser une question ou discuter avec Senku AI',
  author: 'Tata',

  async execute(senderId, args) {
    const userQuestion = args.join(' ').trim();
    const userId = senderId; // Utilise l'ID de l'utilisateur comme identifiant unique pour l'API.

    if (!userQuestion) {
      return sendMessage(senderId, { text: "Veuillez poser une question ou saisir un message. Exemple : !senku Salut" });
    }

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/senku-ai?question=${encodeURIComponent(userQuestion)}&uid=${userId}`);
      const data = response.data;

      if (!data.response) {
        return sendMessage(senderId, { text: "Désolé, aucune réponse n'a été trouvée pour votre requête." });
      }

      const formattedResponse = `
💬 **Senku AI** :
${data.response}
      `.trim();

      await sendMessage(senderId, { text: formattedResponse });
    } catch (error) {
      console.error('Erreur API:', error);
      await sendMessage(senderId, { text: "Une erreur est survenue lors de la communication avec Senku AI. Veuillez réessayer plus tard." });
    }
  }
};
