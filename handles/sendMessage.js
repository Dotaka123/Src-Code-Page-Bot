const axios = require('axios');
const path = require('path');

const MESSAGE_URL = 'https://graph.facebook.com/v21.0/me/messages';
const TYPING_ON = 'typing_on';
const TYPING_OFF = 'typing_off';

// Helper function for POST requests
const axiosPost = (url, data, params = {}) => 
  axios.post(url, data, { params }).then(res => res.data);

// Function to create message payload
const createMessagePayload = (senderId, text, attachment) => {
  const messagePayload = {
    recipient: { id: senderId },
    message: {},
  };

  if (text) {
    messagePayload.message.text = text;
  }

  if (attachment) {
    if (attachment.type === 'template') {
      messagePayload.message.attachment = {
        type: 'template',
        payload: {
          template_type: attachment.payload.template_type,
          elements: attachment.payload.elements || [],
        },
      };
    } else {
      messagePayload.message.attachment = {
        type: attachment.type,
        payload: {
          url: attachment.payload.url,
          is_reusable: true,
        },
      };
    }
  }

  return messagePayload;
};

// Send a message with typing indicators
const sendMessage = async (senderId, { text = '', attachment = null }, pageAccessToken) => {
  if (!text && !attachment) return;

  const params = { access_token: pageAccessToken };

  try {
    await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: TYPING_ON }, params);

    const messagePayload = createMessagePayload(senderId, text, attachment);
    await axiosPost(MESSAGE_URL, messagePayload, params);

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

// Handle postback events
const handlePostback = async (senderId, payload, pageAccessToken) => {
  if (payload === 'WELCOME_MESSAGE') {
    const welcomeMessage = "Bienvenue sur notre bot ! /n Envoyez [help] pour voir les commandes du bot /n Pour soutenir le bot,contactez l admin www.facebook.com/lahatra.gameur /n Ou Envoyer par Mvola (0344322638)";
    await sendMessage(senderId, { text: welcomeMessage }, pageAccessToken);
  }
};

module.exports = { sendMessage, handlePostback };
