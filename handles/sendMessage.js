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

// Indicateur de saisie
const sendTypingIndicator = async (senderId, action, pageAccessToken) => {
  const params = { access_token: pageAccessToken };
  await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: action }, params);
};

// Fonction d'envoi de message
const sendMessage = async (
  senderId,
  { text = '', buttons = null, attachment = null },
  pageAccessToken
) => {
  const params = { access_token: pageAccessToken };

  try {
    // Activer l'indicateur "typing"
    await sendTypingIndicator(senderId, TYPING_ON, pageAccessToken);

    let messagePayload;

    // Validation et construction des boutons
    if (buttons) {
      if (!Array.isArray(buttons)) {
        throw new Error('Buttons must be an array.');
      }

      // Couper à 3 boutons maximum
      if (buttons.length > 3) {
        console.warn('Too many buttons; only the first 3 will be sent.');
        buttons = buttons.slice(0, 3);
      }

      // Construction du payload des boutons
      messagePayload = {
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
    } else if (attachment) {
      // Envoi d'une pièce jointe (image, audio, etc.)
      messagePayload = {
        recipient: { id: senderId },
        message: {
          attachment: attachment,
        },
      };
    } else if (text) {
      // Envoi d'un message texte simple
      messagePayload = {
        recipient: { id: senderId },
        message: { text: text },
      };
    } else {
      throw new Error('No valid message content provided.');
    }

    // Envoi du message
    await axiosPost(MESSAGE_URL, messagePayload, params);

    // Désactiver l'indicateur "typing"
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
