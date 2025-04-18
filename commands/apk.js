const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'phi',
  description: 'Discuter avec Phi-2 (AI)',
  author: 'Tata',
  usage: 'phi [ta question]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hey').trim();
    const encodedInput = encodeURIComponent(input);

    try {
      // Message d'attente
      await sendMessage(senderId, { text: '🤖 Réflexion en cours...' }, pageAccessToken);

      const response = await axios.get(`https://api.zetsu.xyz/ai/phi-2?q=${encodedInput}&uid=${senderId}`);
      const data = response.data;

      if (data.status && data.result) {
        const message = `・────🤖 Phi-2────・\n${data.result.trim()}\n・──────────────・`;
        await sendMessage(senderId, { text: message }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'La réponse est vide ou invalide.' }, pageAccessToken);
      }

    } catch (error) {
      console.error('Erreur Phi:', error.message);
      await sendMessage(senderId, { text: 'Erreur lors de la communication avec Phi-2.' }, pageAccessToken);
    }
  }
};
