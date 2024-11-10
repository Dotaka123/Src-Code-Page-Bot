const { sendMessage } = require('./sendMessage');
const axios = require('axios');

// Object to store user preferences (in-memory)
let userPreferences = {};

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    return console.error('Invalid postback event object');
  }

  try {
    if (payload === 'WELCOME_MESSAGE') {
      const buttons = [
        {
          type: 'postback',
          title: 'Mode Fille',
          payload: 'MODE_FILLE'
        },
        {
          type: 'postback',
          title: 'Mode Garçon',
          payload: 'MODE_GARCON'
        }
      ];

      const messagePayload = {
        recipient: { id: senderId },
        message: {
          text: 'Bienvenue dans l\'univers de Girlfriend AI ! Choisissez un mode pour commencer.🥰',
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: 'Sélectionnez votre mode:',
              buttons: buttons
            }
          }
        }
      };

      await sendMessage(senderId, messagePayload, pageAccessToken);
    }

    // Si l'utilisateur choisit "Mode Fille"
    else if (payload === 'MODE_FILLE') {
      userPreferences[senderId] = { mode: 'fille' };
      await sendMessage(senderId, { text: 'Mode fille activé. Prête à discuter ! 💕' }, pageAccessToken);
    }
    // Si l'utilisateur choisit "Mode Garçon"
    else if (payload === 'MODE_GARCON') {
      userPreferences[senderId] = { mode: 'garcon' };
      await sendMessage(senderId, { text: 'Mode garçon activé. Je suis là pour être ton petit copain 💙' }, pageAccessToken);
    } else {
      await sendMessage(senderId, { text: `Vous avez envoyé un postback avec le payload : ${payload}` }, pageAccessToken);
    }
  } catch (err) {
    console.error('Error sending postback response:', err.message || err);
  }
};

module.exports = { handlePostback };
