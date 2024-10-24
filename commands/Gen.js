const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'Gen',
  description: 'Example command',
  author: 'tata',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      // Envoi de la requête à l'API de génération d'images
      sendMessage(senderId, { text: 'Generation de l image pour mon babe...😍.' }, pageAccessToken);
      const imageApiUrl = `https://joshweb.click/api/art?prompt=${encodeURIComponent(modifiedPrompt)}`;
      const imageResponse = await axios.get(imageApiUrl);

      // Envoi de l'image au user
      await sendMessage(senderId, { attachment: { type: 'image', payload: { url: imageResponse.data, is_reusable: true } } }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
