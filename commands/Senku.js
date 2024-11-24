const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'senku',
  description: 'Discuter avec senku ai',
  author: 'Tata',
  usage:'senku [ta question]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      await sendMessage(senderId, { text: '🤔...' }, pageAccessToken);
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/senku-ai?question=${encodeURIComponent(modifiedPrompt)}&uid={senderId}`);
      const data = response.data;
      const formattedMessage = `・─💬Senku─・\n${data.response}\n・──── >ᴗ< ────・`;
      await sendMessage(senderId, { text: 'Admin: www.facebook.com/lahatra.gameur' }, pageAccessToken);
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
