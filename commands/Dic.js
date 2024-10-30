const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'dic',
  description: 'Fetch definitions of a word with audio pronunciation',
  author: 'tata',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const word = args.join(' ').trim();

    if (!word) {
      await sendMessage(senderId, { text: 'Please provide a word to define.' }, pageAccessToken);
      return;
    }

    try {
      const response = await axios.get(`https://ccprojectapis.ddns.net/api/dictio?q=${encodeURIComponent(word)}`);
      const data = response.data;

      if (!data || !data.status) {
        await sendMessage(senderId, { text: `No definition found for "${word}".` }, pageAccessToken);
        return;
      }

      // Constructing the dictionary message
      let formattedMessage = `・────📚 Dictionary ────・\n`;
      formattedMessage += `Word: ${data.word}\nPhonetic: ${data.phonetic || 'N/A'}\n\n`;

      data.meanings.forEach((meaning, index) => {
        formattedMessage += `(${index + 1}) Part of Speech: ${meaning.partOfSpeech}\n`;
        meaning.definitions.forEach((def, idx) => {
          formattedMessage += ` - ${def.definition}\n`;
          if (def.example) {
            formattedMessage += `   Example: "${def.example}"\n`;
          }
        });
        formattedMessage += '\n';
      });

      formattedMessage += `・─────────────・`;

      // Send the formatted dictionary response
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);

      // Check if there is an audio URL and send it as a separate message
      if (data.audio) {
        await sendMessage(senderId, { attachment: { type: 'audio', payload: { url: data.audio } } }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unable to fetch the definition. Please try again later.' }, pageAccessToken);
    }
  }
};
