const axios = require('axios');
const path = require('path');

const MESSAGE_URL = 'https://graph.facebook.com/v21.0/me/messages';
const TYPING_ON = 'typing_on';
const TYPING_OFF = 'typing_off';
const TEXT_LIMIT = 2000; // Limite maximale pour le texte

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

// Afficher un indicateur de saisie
const sendTypingIndicator = async (senderId, action, pageAccessToken) => {
  const params = { access_token: pageAccessToken };
  await axiosPost(MESSAGE_URL, { recipient: { id: senderId }, sender_action: action }, params);
};

// Découpe un texte long en plusieurs messages
const splitText = (text) => {
  const chunks = [];
  while (text.length > TEXT_LIMIT) {
    const chunk = text.slice(0, TEXT_LIMIT);
    chunks.push(chunk);
    text = text.slice(TEXT_LIMIT);
  }
  if (text.length > 0) {
    chunks.push(text);
  }
  return chunks;
};

// Crée les payloads de message
const createMessagePayload = (senderId, text, attachment, buttons, quickReplies) => {
  const messagePayload = { recipient: { id: senderId }, message: {} };

  if (attachment) {
    messagePayload.message.attachment = {
      type: attachment.type,
      payload: {
        url: attachment.url,
        is_reusable: true,
      },
    };
  } else if (buttons) {
    if (buttons.length > 3) {
      throw new Error('Too many buttons: Maximum allowed is 3.');
    }
    messagePayload.message.attachment = {
      type: 'template',
      payload: {
        template_type: 'button',
        text: text,
        buttons: buttons,
      },
    };
  } else if (quickReplies) {
    messagePayload.message.text = text;
    messagePayload.message.quick_replies = quickReplies;
  } else if (text) {
    messagePayload.message.text = text;
  } else {
    throw new Error('No valid message payload provided.');
  }

  return messagePayload;
};

// Envoi du message
const sendMessage = async (
  senderId,
  { text = '', attachment = null, buttons = null, quickReplies = null },
  pageAccessToken
) => {
  if (!text && !attachment && !buttons && !quickReplies) {
    console.error('No message content provided.');
    return;
  }

  const params = { access_token: pageAccessToken };

  try {
    // Affiche l'indicateur "typing"
    await sendTypingIndicator(senderId, TYPING_ON, pageAccessToken);

    // Gestion des textes longs : découpage automatique
    const textChunks = text ? splitText(text) : [];

    // Envoi des messages texte découpés
    for (const chunk of textChunks) {
      const messagePayload = createMessagePayload(senderId, chunk, null, null, null);
      await axiosPost(MESSAGE_URL, messagePayload, params);
    }

    // Envoi du message avec pièce jointe, boutons ou quick replies
    if (attachment || buttons || quickReplies) {
      const messagePayload = createMessagePayload(senderId, text, attachment, buttons, quickReplies);
      await axiosPost(MESSAGE
