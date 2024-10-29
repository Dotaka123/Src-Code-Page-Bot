const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Lecture du token d'accès pour l'envoi des messages
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'video',
  description: 'Search for YouTube videos and provide an option to download audio',
  author: 'Kenneth Panio',
  
  async execute(senderId, args) {
    const pageAccessToken = token;
    const searchQuery = args.join(' ').trim();

    // Vérifie si un terme de recherche est fourni
    if (!searchQuery) {
      return await sendMessage(senderId, { text: 'Veuillez fournir un terme de recherche pour YouTube.' }, pageAccessToken);
    }

    try {
      // Recherche des vidéos YouTube
      const searchUrl = `https://me0xn4hy3i.execute-api.us-east-1.amazonaws.com/staging/api/resolve/resolveYoutubeSearch?search=${encodeURIComponent(searchQuery)}`;
      const searchResponse = await axios.get(searchUrl);
      const searchData = searchResponse.data;

      // Vérification des résultats de recherche
      if (searchData.code !== 200 || !searchData.data.length) {
        return await sendMessage(senderId, { text: 'Aucun résultat trouvé pour votre recherche.' }, pageAccessToken);
      }

      // Limiter les résultats affichés (ex. 3 résultats)
      const videos = searchData.data.slice(0, 3);

      // Formater les éléments pour les vidéos de recherche
      const elements = videos.map(video => ({
        title: video.title,
        image_url: video.imgSrc,
        subtitle: `Durée: ${video.duration} | Vues: ${video.views}`,
        buttons: [{
          type: 'postback',
          title: 'Télécharger Audio',
          payload: `DOWNLOAD_AUDIO_${video.videoId}`
        }]
      }));

      // Envoie les résultats de recherche avec les options de téléchargement
      const message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: elements
          }
        }
      };
      
      await sendMessage(senderId, message, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Erreur lors de la recherche de vidéos YouTube.' }, pageAccessToken);
    }
  },

  // Gère les clics sur les boutons de téléchargement d’audio
  async handlePostback(senderId, payload) {
    const pageAccessToken = token;

    if (payload.startsWith("DOWNLOAD_AUDIO_")) {
      const videoId = payload.split("DOWNLOAD_AUDIO_")[1];
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const downloadUrl = `https://api-improve-production.up.railway.app/yt/download?url=${encodeURIComponent(videoUrl)}&format=mp3&quality=180`;

      try {
        // Récupère l'audio avec l'API de téléchargement
        const downloadResponse = await axios.get(downloadUrl);
        const audioData = downloadResponse.data;

        // Vérifie si le téléchargement a réussi
        if (audioData.message !== 'Audio downloaded successfully.') {
          return await sendMessage(senderId, { text: 'Erreur: Impossible de télécharger l\'audio pour cette vidéo.' }, pageAccessToken);
        }

        // Envoie le lien de téléchargement de l'audio à l'utilisateur
        const audioMessage = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: [{
                title: audioData.info.title,
                image_url: audioData.info.thumbnail,
                subtitle: `Télécharger l'audio de ${audioData.info.artist}`,
                buttons: [{
                  type: 'web_url',
                  url: audioData.audio,
                  title: 'Télécharger Audio',
                  webview_height_ratio: 'tall'
                }]
              }]
            }
          }
        };

        await sendMessage(senderId, audioMessage, pageAccessToken);

      } catch (error) {
        console.error('Error downloading audio:', error);
        await sendMessage(senderId, { text: 'Erreur lors du téléchargement de l\'audio.' }, pageAccessToken);
      }
    }
  }
};
