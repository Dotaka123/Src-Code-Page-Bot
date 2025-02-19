const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const { setUser Mode } = require('../commands/gpt4');
const { getDownloadDetails } = require("youtube-downloader-cc-api"); // Importer la nouvelle API

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    console.error('Invalid postback event object');
    return;
  }

  try {
    if (payload === 'WELCOME_MESSAGE') {
      const welcomeMessage = '🇫🇷 Bienvenue dans l\'univers de Girlfriend AI 🌟!\nChoisissez votre mode de conversation pour commencer :';

      const buttons = [
        {
          type: 'postback',
          title: 'Mode fille 💖',
          payload: 'MODE_FILLE'
        },
        {
          type: 'postback',
          title: 'Mode garçon 💙',
          payload: 'MODE_GARCON'
        },
        {
          type: 'postback',
          title: 'Mode normal 🧠',
          payload: 'MODE_SENKU'
        }
      ];

      await sendMessage(senderId, { text: welcomeMessage, buttons }, pageAccessToken);
    }
    
    // Gestion du mode fille
    else if (payload === 'MODE_FILLE') {
      setUser Mode(senderId, 'fille');
      await sendMessage(senderId, { text: 'Mode fille activé ! 💕 Parlez avec Miora !' }, pageAccessToken);
    }

    // Gestion du mode garçon
    else if (payload === 'MODE_GARCON') {
      setUser Mode(senderId, 'garcon');
      await sendMessage(senderId, { text: 'Mode garçon activé ! 💙 Parlez avec Nario !' }, pageAccessToken);
    }

    // Gestion du mode Senku
    else if (payload === 'MODE_SENKU') {
      setUser Mode(senderId, 'senku');
      await sendMessage(senderId, { text: 'Mode normal activé ! 🧠 Posez vos questions à GPT-4o !' }, pageAccessToken);
    }

    // Gestion du postback "Écouter"
    else if (payload.startsWith('LISTEN_AUDIO_')) {
      const videoId = payload.split('_')[2];
      const videoUrl = `https://youtu.be/${videoId}`; // Construire l'URL de la vidéo YouTube

      try {
        await sendMessage(senderId, { text: 'Téléchargement de l\'audio en cours...' }, pageAccessToken);

        // Utiliser la nouvelle API pour obtenir les détails de téléchargement
        const response = await getDownloadDetails(videoUrl, 'mp3');

        if (response && response.audio) {
          const audioUrl = response.audio; // Assurez-vous que la réponse contient l'URL audio

          // Envoyer le fichier audio à l'utilisateur
          await sendMessage(
            senderId,
            {
              attachment: {
                type: 'audio',
                payload: { url: audioUrl }
              }
            },
            pageAccessToken
          );
        } else {
          await sendMessage(senderId, { text: 'Impossible de récupérer l\'audio.' }, pageAccessToken);
        }
      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'audio:', error.message);
        await sendMessage(senderId, { text: 'Erreur lors du téléchargement de l\'audio.' }, pageAccessToken);
      }
    } 
    
    // Pour tout autre postback inconnu
    else {
      await sendMessage(senderId, { text: `Postback inconnu : ${payload}` }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error handling postback:', error.message);

    if (typeof sendMessage === 'function') {
      await sendMessage(senderId, { text: 'Une erreur est survenue. Veuillez réessayer.' }, pageAccessToken);
    } else {
      console.error('sendMessage is not defined or is not a function.');
    }
  }
};

module.exports = { handlePostback };
