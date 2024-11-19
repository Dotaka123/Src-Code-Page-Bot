const axios = require('axios');
const path = require('path');

const MESSAGE_URL = 'https://graph.facebook.com/v21.0/me/messages';
const TYPING_ON = 'typing_on';
const TYPING_OFF = 'typing_off';
const WELCOME_MESSAGE = 'Bienvenue sur notre bot ! \nEnvoyez [help] pour voir les commandes du bot.';

// Helper function for POST requests
const axiosPost = (url, data, params = {}) =>
  axios.post(url, data, { params }).then(res => res.data);

// Function to create message payload
const createMessagePayload = (senderId, text, attachment, quickReplies) => {
  const messagePayload = {
    recipient: { id: senderId },
    message: {},
  };

  if (text && !attachment) {
    messagePayload.message.text = text;
  } else if (attachment) {
    messagePayload.message.attachment = attachment;
  }

  // Ajout des quick replies si fournis
  if (quickReplies) {
    messagePayload.message.quick_replies = quickReplies;
  }

  return messagePayload;
};

// Function to send a message with typing indicators
const sendMessage = async (senderId, { text = '', buttons = null, attachment = null, quickReplies = null }, pageAccessToken) => {
  if (!text && !attachment && !buttons && !quickReplies) return;

  const params = { access_token: pageAccessToken };

  try {
    // Envoie l'indicateur de saisie
    await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: TYPING_ON }, params);

    let messagePayload;

    if (buttons) {
      // Limiter les boutons à 3 (restriction de Messenger)
      const limitedButtons = buttons.slice(0, 3);
      messagePayload = {
        recipient: { id: senderId },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: text,
              buttons: limitedButtons,
            },
          },
        },
      };
    } else if (quickReplies) {
      // Payload pour les quick replies
      messagePayload = {
        recipient: { id: senderId },
        message: {
          text: text,
          quick_replies: quickReplies,
        },
      };
    } else if (attachment) {
      // Payload pour une pièce jointe
      messagePayload = createMessagePayload(senderId, text, attachment);
    } else {
      // Message texte simple
      messagePayload = createMessagePayload(senderId, text);
    }

    // Envoie le message
    await axiosPost(MESSAGE_URL, messagePayload, params);

    // Désactive l'indicateur de saisie
    await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: TYPING_OFF }, params);
  } catch (e) {
    const errorMessage = e.response?.data?.error?.message || e.message;
    console.error(`Error in ${path.basename(__filename)}: ${errorMessage}`);
    await axiosPost(MESSAGE_URL, {
      recipient: { id: senderId },
      message: { text: 'An error occurred while sending your message. Please try again.' },
    }, params);
  }
};

module.exports = { sendMessage };
