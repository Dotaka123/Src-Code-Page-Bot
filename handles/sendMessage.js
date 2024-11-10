const axios = require('axios');
const path = require('path');

const MESSAGE_URL = 'https://graph.facebook.com/v21.0/me/messages';
const TYPING_ON = 'typing_on';
const TYPING_OFF = 'typing_off';
const WELCOME_MESSAGE = 'Bienvenue sur notre bot ! \nEnvoyez [help] pour voir les commandes du bot.\nPour soutenir le bot, contactez l’admin www.facebook.com/lahatra.gameur\nOu envoyez par Mvola (0344322638).';

// Helper function for POST requests
const axiosPost = (url, data, params = {}) => 
  axios.post(url, data, { params }).then(res => res.data);

// Function to create message payload
const createMessagePayload = (senderId, text, attachment, quickReplies = null) => {
  const messagePayload = {
    recipient: { id: senderId },
    message: {},
  };

  if (text && !attachment) {
    messagePayload.message.text = text;
  } else if (attachment) {
    if (attachment.type === 'template' && attachment.payload.template_type === 'button') {
      messagePayload.message.attachment = {
        type: 'template',
        payload: {
          template_type: 'button',
          text: attachment.payload.text,
          buttons: attachment.payload.buttons || [],
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

  // Ajouter la gestion des Quick Replies
  if (quickReplies) {
    messagePayload.message.quick_replies = quickReplies.map(reply => ({
      content_type: 'text',
      title: reply.title,
      payload: reply.payload,
    }));
  }

  return messagePayload;
};

// Send a message with typing indicators
const sendMessage = async (senderId, { text = '', attachment = null, quickReplies = null }, pageAccessToken) => {
  if (!text && !attachment && !quickReplies) return;

  const params = { access_token: pageAccessToken };

  try {
    await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: TYPING_ON }, params);
    const messagePayload = createMessagePayload(senderId, text, attachment, quickReplies);
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

module.exports = { sendMessage };
