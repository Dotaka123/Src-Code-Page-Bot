const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'chatgpt',
  description: 'Discuter avec chatgpt le modele gpt3 d'/OpenAi',
  author: 'Tata',
  usage:'chatgpt [ta question]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      const response = await axios.get(`https://www.samirxpikachu.run.place/gpt?content=${encodeURIComponent(modifiedPrompt)}`);
      const data = response.data;
      const formattedMessage = `・────chatgpt────・\n${data.message.content}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
