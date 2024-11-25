const axios = require('axios');
const { sendMessage } = require('./sendMessage'); // Assurez-vous que ce chemin est correct
const { setUserMode } = require('../commands/gpt4'); // Vérifiez également ce chemin

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

      // Envoyer les boutons pour choisir le mode
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
          title: 'Mode Senku 🧠',
          payload: 'MODE_SENKU'
        }
      ];

      await sendMessage(senderId, { text: welcomeMessage, buttons }, pageAccessToken);
    }
    
    // Gestion du mode fille
    else if (payload === 'MODE_FILLE') {
      setUserMode(senderId, 'fille');
      await sendMessage(senderId, { text: 'Mode fille activé ! 💕 Parlez avec Miora !' }, pageAccessToken);
    }

    // Gestion du mode garçon
    else if (payload === 'MODE_GARCON') {
      setUserMode(senderId, 'garcon');
      await sendMessage(senderId, { text: 'Mode garçon activé ! 💙 Parlez avec Nario !' }, pageAccessToken);
    }

    // Gestion du mode Senku
    else if (payload === 'MODE_SENKU') {
      setUserMode(senderId, 'senku');
      await sendMessage(senderId, { text: 'Mode Senku activé ! 🧠 Posez vos questions à Senku !' }, pageAccessToken);
    }

    // Gestion du postback "Écouter"
    else if (payload.startsWith('LISTEN_AUDIO_')) {
      const videoId = payload.split('_')[2];
      const downloadUrl = `https://api-improve-production.up.railway.app/yt/download?url=https://www.youtube.com/watch?v=${videoId}&format=mp3&quality=128`;

      try {
        await sendMessage(senderId, { text: 'Téléchargement de l\'audio en cours...' }, pageAccessToken);

        // Utiliser l'API pour télécharger l'audio en MP3
        const downloadResponse = await axios.get(downloadUrl);
        
        if (downloadResponse && downloadResponse.data && downloadResponse.data.audio) {
          const audioUrl = downloadResponse.data.audio;

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

    // Vérifier si sendMessage est défini avant de l'utiliser
    if (typeof sendMessage === 'function') {
      await sendMessage(senderId, { text: 'Une erreur est survenue. Veuillez réessayer.' }, pageAccessToken);
    } else {
      console.error('sendMessage is not defined or is not a function.');
    }
  }
};

module.exports = { handlePostback };
