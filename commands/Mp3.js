const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'mp3',
  description: 'Example command',
  author: 'Coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      const response = await axios.get(`https://joshweb.click/new/voicevox-synthesis?id=2&text=${encodeURIComponent(modifiedPrompt)}`);
      const data = response.data;

      // Enregistrement du fichier vocal
      const filePath = `./voice.mp3`;
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(data);
      writeStream.end();
      writeStream.on('finish', () => {
        // Envoi du fichier vocal en tant que message
        await sendMessage(senderId, { audio: filePath }, pageAccessToken);
        // Suppression du fichier vocal
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
