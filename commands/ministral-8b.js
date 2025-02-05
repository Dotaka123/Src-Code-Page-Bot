const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'ministral',
  description: 'Discuter avec ministral ai-8b',
  author: 'Tata',
  usage:'ministral [ta question]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      await sendMessage(senderId, { text: '🤔...' }, pageAccessToken);
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/ministral-8b?q=${encodeURIComponent(modifiedPrompt)}&uid=${senderId}`);
      const data = response.data;
      const formattedMessage = `・-🧠Ministral-8b🧠-・\n${data.content}\n・─ >ᴗ< ─・`;
      await sendMessage(senderId, { text: 'Admin: www.facebook.com/lahatra.gameur' }, pageAccessToken);
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
