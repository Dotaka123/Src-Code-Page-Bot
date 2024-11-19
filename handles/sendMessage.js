const axios = require('axios');
const path = require('path');

const MESSAGE_URL = 'https://graph.facebook.com/v21.0/me/messages';
const TYPING_ON = 'typing_on';
const TYPING_OFF = 'typing_off';

// Helper function for POST requests
const axiosPost = (url, data, params = {}) => 
  axios.post(url, data, { params }).then((res) => res.data);

// Helper function to check if a URL is valid
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Create message payload
const createMessagePayload = (senderId, text, attachment, quickReplies) => {
  const messagePayload = {
    recipient: { id: senderId },
    message: {},
  };

  if (text) {
    messagePayload.message.text = text;
  }

  if (attachment) {
    messagePayload.message.attachment = attachment;
  }

  if (quickReplies) {
    messagePayload.message.quick_replies = quickReplies;
  }

  return messagePayload;
};

// Send a message with typing indicators
const sendMessage = async (senderId, { text = '', buttons = null, attachment = null, quickReplies = null }, pageAccessToken) => {
  if (!text && !attachment && !buttons && !quickReplies) return;

  const params = { access_token: pageAccessToken };

  try {
    // Indicate typing on
    await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: TYPING_ON }, params);

    let messagePayload;

    if (buttons) {
      // Buttons template
      messagePayload = {
        recipient: { id: senderId },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text,
              buttons,
            },
          },
        },
      };
    } else if (quickReplies) {
      // Quick replies
      messagePayload = {
        recipient: { id: senderId },
        message: {
          text,
          quick_replies: quickReplies,
        },
      };
    } else if (attachment) {
      // Validate the attachment URL
      if (!isValidUrl(attachment.payload.url)) {
        throw new Error('Invalid attachment URL.');
      }

      messagePayload = createMessagePayload(senderId, text, attachment);
    } else {
      // Standard text message
      messagePayload = createMessagePayload(senderId, text);
    }

    // Send the message
    await axiosPost(MESSAGE_URL, messagePayload, params);

    // Indicate typing off
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
