const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const { setUserMode } = require('../commands/gpt4');

// Map pour mémoriser le choix de l'utilisateur
const userDefaults = new Map();

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    return console.error('Invalid postback event object');
  }

  try {
    if (payload === 'WELCOME_MESSAGE') {
      const welcomeMessage = '🇫🇷 Bienvenue dans l\'univers de Girlfriend AI 🌟!\nChoisissez votre mode de conversation pour commencer :';

      // Envoyer les boutons pour choisir le mode fille ou garçon
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
        }
      ];

      // Ajouter des quick replies pour sélectionner Gpt4 ou Hercai
      const quickReplies = [
        {
          content_type: 'text',
          title: 'Gpt4',
          payload: 'GPT4'
        },
        {
          content_type: 'text',
          title: 'Hercai',
          payload: 'HERCAI'
        }
      ];

      await sendMessage(senderId, { text: welcomeMessage, buttons, quick_replies: quickReplies }, pageAccessToken);
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

    // Gestion du Quick Reply pour Gpt4
    else if (payload === 'GPT4') {
      console.log('Quick Reply "Gpt4" sélectionné');
      userDefaults.set(senderId, 'gpt4'); // Enregistrer 'gpt4' comme commande par défaut
      await sendMessage(senderId, { text: 'Mode GPT-4 activé ! 🧠' }, pageAccessToken);
    }

    // Gestion du Quick Reply pour Hercai
    else if (payload === 'HERCAI') {
      console.log('Quick Reply "Hercai" sélectionné');
      userDefaults.set(senderId, 'hercai'); // Enregistrer 'hercai' comme commande par défaut
      await sendMessage(senderId, { text: 'Mode Hercai activé ! 🎭' }, pageAccessToken);
    }

    // Gestion du postback "Écouter"
    else if (payload.startsWith('LISTEN_AUDIO_')) {
      const videoId = payload.split('_')[2];
      const downloadUrl = `https://api-improve-production.up.railway.app/yt/download?url=https://www.youtube.com/watch?v=${videoId}&format=mp3&quality=128`;

      try {
        sendMessage(senderId, { text: 'Telechargement de l\'audio en cours...' }, pageAccessToken);
        const downloadResponse = await axios.get(downloadUrl);
        const audioUrl = downloadResponse.data.audio;

        if (audioUrl) {
          await sendMessage(senderId, {
            attachment: {
              type: 'audio',
              payload: { url: audioUrl }
            }
          }, pageAccessToken);
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
    await sendMessage(senderId, { text: 'Une erreur est survenue. Veuillez réessayer.' }, pageAccessToken);
  }
};

// Exporter la fonction userDefaults pour l'utiliser ailleurs
module.exports = { handlePostback, userDefaults };
