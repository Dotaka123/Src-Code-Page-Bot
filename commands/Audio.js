const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'Voice',
  description: 'Send a voice message using VoiceVox Synthesis',
  author: 'Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const text = args.join(' ');
    try {
      sendMessage(senderId, { text: 'Génération de votre message vocal...' }, pageAccessToken);
      const apiUrl = `https://joshweb.click/new/voicevox-synthesis?id=1&text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      // Save the audio file temporarily
      const audioPath = path.join(__dirname, 'voice_message.mp3');
      fs.writeFileSync(audioPath, response.data);

      // Send the audio file
      sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: `file://${audioPath}`,
            is_reusable: true
          }
        }
      }, pageAccessToken);

      // Clean up the temporary file
      fs.unlinkSync(audioPath);
    } catch (error) {
      console.error('Error calling VoiceVox Synthesis API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your voice message request.' }, pageAccessToken);
    }
  }
};
