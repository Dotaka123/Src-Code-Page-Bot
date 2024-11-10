const { sendMessage } = require('./sendMessage');
const { setUserMode } = require('../commands/gpt4');

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    return console.error('Invalid postback event object');
  }

  try {
    if (payload === 'WELCOME_MESSAGE') {
      const welcomeMessage = `
🇫🇷 Bienvenue dans l'univers de Girlfriend AI 🌟! 
Choisissez votre mode de conversation pour commencer :
      `;

      // Envoyer les boutons pour choisir le mode
      await sendMessage(senderId, {
        text: welcomeMessage.trim(),
        buttons: [
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
        ]
      }, pageAccessToken);
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
    } else {
      await sendMessage(senderId, { text: `Postback inconnu : ${payload}` }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error handling postback:', error.message);
    await sendMessage(senderId, { text: 'Une erreur est survenue. Veuillez réessayer.' }, pageAccessToken);
  }
};

module.exports = { handlePostback };
