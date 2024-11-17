const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'cohere',
  description: 'Discuter avec cohere ai',
  author: 'Tata',
  usage:'cohere [ta question]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      await sendMessage(senderId, { text: '🤔...' }, pageAccessToken);
      const response = await axios.get(`https://hiroshi-api.onrender.com/ai/cohere?ask=${encodeURIComponent(modifiedPrompt)}`);
      const data = response.data;
      const formattedMessage = `・──🧠Cohere-Ai🧠──・\n${data.response}\n・──── >ᴗ< ────・`;
      await sendMessage(senderId, { text: 'Admin: www.facebook.com/lahatra.gameur' }, pageAccessToken);
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
