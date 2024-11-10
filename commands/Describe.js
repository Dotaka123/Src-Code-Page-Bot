const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'describe',
  description: 'Décrire une image envoyée par l\'utilisateur',
  author: 'Tata',
  usage: 'Envoyer une image pour recevoir une description',

  async execute(senderId, args, pageAccessToken) {
    const imageUrl = args[0]; // Supposons que l'URL de l'image est passée dans les arguments (ou obtenir l'URL d'image depuis un autre mécanisme)

    if (!imageUrl) {
      await sendMessage(senderId, { text: 'Veuillez envoyer une image pour la décrire.' }, pageAccessToken);
      return;
    }

    try {
      const response = await axios.get(`https://joshweb.click/gemini?prompt=describe%20this%20photo&url=${encodeURIComponent(imageUrl)}`);
      const data = response.data;

      const description = data.gemini;
      const formattedMessage = `・──── Description de l'image ────・\n${description}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Erreur: Impossible de décrire l\'image.' }, pageAccessToken);
    }
  }
};
