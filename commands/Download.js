const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'download',
  description: 'Download audio from a YouTube video and send it as a voice message',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const videoUrl = args[0]; // On attend que l'utilisateur fournisse le lien de la vidéo

    if (!videoUrl || !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      await sendMessage(senderId, { text: "Veuillez fournir un lien valide de vidéo YouTube." }, pageAccessToken);
      return;
    }

    try {
      // Étape 1: Télécharger l'audio de la vidéo
      const downloadResponse = await axios.get(`https://api-improve-production.up.railway.app/yt/download?url=${encodeURIComponent(videoUrl)}&format=mp3&quality=180`);
      const downloadData = downloadResponse.data;

      if (downloadData.message === "Audio downloaded successfully.") {
        const audioUrl = downloadData.audio;

        // Étape 2: Envoyer le message vocal à l'utilisateur
        await sendMessage(senderId, { attachment: { type: 'audio', payload: { url: audioUrl } } }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: "Une erreur s'est produite lors du téléchargement de l'audio." }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Une erreur est survenue lors de la demande au service de téléchargement.' }, pageAccessToken);
    }
  }
};
