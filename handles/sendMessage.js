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
    // Handle different types of attachments
    if (attachment.type === 'template') {
      messagePayload.message.attachment = {
        type: 'template',
        payload: {
          template_type: attachment.payload.template_type,
          elements: attachment.payload.elements || [],
        },
      };
    } else {
      // Handle video attachment
      messagePayload.message.attachment = {
        type: attachment.type,
        payload: {
          url: attachment.payload.url, // Ensure this URL points to a valid video URL
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
    // Turn on typing indicator
    await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: TYPING_ON }, params);

    // Create message payload
    const messagePayload = createMessagePayload(senderId, text, attachment);

    // Send the message
    await axiosPost(MESSAGE_URL, messagePayload, params);

    // Turn off typing indicator
    await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: TYPING_OFF }, params);
  } catch (e) {
    const errorMessage = e.response?.data?.error?.message || e.message;
    console.error(`Error in ${path.basename(__filename)}: ${errorMessage}`);

    // Optional: Send an error message back to the user
    await axiosPost(MESSAGE_URL, {
      recipient: { id: senderId },
      message: { text: 'An error occurred while sending your message. Please try again.' },
    }, params);
  }
};

module.exports = { sendMessage };
