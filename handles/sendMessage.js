const axios = require('axios');
const path = require('path');

const MESSAGE_URL = 'https://graph.facebook.com/v21.0/me/messages';
const TYPING_ON = 'typing_on';
const TYPING_OFF = 'typing_off';

// Fonction auxiliaire pour les requêtes POST
const axiosPost = async (url, data, params = {}) => {
  try {
    const response = await axios.post(url, data, { params });
    return response.data;
  } catch (error) {
    console.error(`Error in axiosPost: ${error.response?.data?.error?.message || error.message}`);
    throw error;
  }
};

// Affiche un indicateur "typing"
const sendTypingIndicator = async (senderId, action, pageAccessToken) => {
  const params = { access_token: pageAccessToken };
  await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: action }, params);
};

// Envoi d'un message avec des boutons
const sendMessage = async (
  senderId,
  { text = '', buttons = null },
  pageAccessToken
) => {
  const params = { access_token: pageAccessToken };

  try {
    // Affiche l'indicateur "typing"
    await sendTypingIndicator(senderId, TYPING_ON, pageAccessToken);

    // Vérifie si des boutons sont définis
    if (buttons) {
      if (!Array.isArray(buttons) || buttons.length > 3) {
        throw new Error('Buttons must be an array with a maximum of 3 elements.');
      }

      // Construction du payload pour les boutons
      const messagePayload = {
        recipient: { id: senderId },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: text,
              buttons: buttons,
            },
          },
        },
      };

      // Envoie le message avec les boutons
      await axiosPost(MESSAGE_URL, messagePayload, params);
    } else if (text) {
      // Si aucun bouton, envoie un message texte simple
      const messagePayload = {
        recipient: { id: senderId },
        message: { text: text },
      };
      await axiosPost(MESSAGE_URL, messagePayload, params);
    }

    // Désactive l'indicateur "typing"
    await sendTypingIndicator(senderId, TYPING_OFF, pageAccessToken);
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error(`Error in ${path.basename(__filename)}: ${errorMessage}`);

    // Envoi d'un message d'erreur utilisateur
    await axiosPost(
      MESSAGE_URL,
      {
        recipient: { id: senderId },
        message: { text: 'An error occurred while sending your message. Please try again.' },
      },
      params
    );
  }
};

module.exports = { sendMessage };
