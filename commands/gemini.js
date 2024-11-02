const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'gemini',
  description: 'Interact with Google Gemini',
  usage: 'gemini [your message]',
  author: 'tata',
  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) return sendMessage(senderId, { text: "Usage: gemini <your message>" }, pageAccessToken);

    try {
      sendMessage(senderId, {text: '...✍🏻'},pageAccessToken);
      const { data } = await axios.get(`https://rest-api-production-5054.up.railway.app/google?prompt=${encodeURIComponent(prompt)}&model=gemini-1.5-flash&uid=${senderId}`);
      sendMessage(senderId, { text: data.message }, pageAccessToken);
    } catch {
      sendMessage(senderId, { text: 'Error generating response. Try again later.' }, pageAccessToken);
    }
  }
};
