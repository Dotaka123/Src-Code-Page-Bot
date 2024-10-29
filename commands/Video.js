const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Lecture du token d'accès pour l'envoi des messages
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'video',
  description: 'Search and provide downloadable audio links from YouTube',
  author: 'Tata',

  async executePostback(senderId, postbackPayload) {
    const pageAccessToken = token;

    // Extraction de l'URL depuis le payload
    if (postbackPayload.startsWith('DOWNLOAD_AUDIO_')) {
      const videoId = postbackPayload.replace('DOWNLOAD_AUDIO_', '');
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      try {
        // Appel API pour télécharger l'audio
        const downloadApiUrl = `https://api-improve-production.up.railway.app/yt/download?url=${videoUrl}&format=mp3&quality=180`;
        const downloadResponse = await axios.get(downloadApiUrl);
        const audioUrl = downloadResponse.data.audio;

        // Envoi de l'audio en réponse
        await sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: {
              url: audioUrl
            }
          }
        }, pageAccessToken);
      } catch (error) {
        console.error('Error downloading audio:', error);
        await sendMessage(senderId, { text: 'Erreur lors du téléchargement de l’audio.' }, pageAccessToken);
      }
    }
  },

  async execute(senderId, args) {
    const pageAccessToken = token;
    const searchQuery = args.join(' ').trim();

    if (!searchQuery) {
      return await sendMessage(senderId, { text: 'Veuillez fournir une recherche pour trouver des vidéos.' }, pageAccessToken);
    }

    try {
      // Appel de l'API de recherche YouTube
      const searchApiUrl = `https://me0xn4hy3i.execute-api.us-east-1.amazonaws.com/staging/api/resolve/resolveYoutubeSearch?search=${encodeURIComponent(searchQuery)}`;
      const searchResponse = await axios.get(searchApiUrl);
      const videos = searchResponse.data.data;

      if (videos && videos.length > 0) {
        // Préparation des boutons pour chaque vidéo
        const elements = videos.slice(0, 5).map(video => ({
          title: video.title,
          image_url: video.imgSrc,
          subtitle: `Durée: ${video.duration} | Vues: ${video.views}`,
          buttons: [
            {
              type: 'postback',
              title: 'Regarder',
              payload: `DOWNLOAD_AUDIO_${video.videoId}`
            }
          ]
        }));

        // Envoi des résultats sous forme de template
        await sendMessage(senderId, {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Aucune vidéo trouvée pour cette recherche.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error searching for videos:', error);
      await sendMessage(senderId, { text: 'Erreur lors de la recherche de vidéos.' }, pageAccessToken);
    }
  }
};
