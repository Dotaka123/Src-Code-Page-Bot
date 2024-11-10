const { sendMessage } = require('./sendMessage');
const axios = require('axios');

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    return console.error('Invalid postback event object');
  }

  try {
    // Vérifier si le payload est 'GET_STARTED' pour envoyer un message de bienvenue avec des boutons
    if (payload === 'GET_STARTED') {
      const welcomeMessage = `
🇫🇷: Bienvenue dans l'univers de Girlfriend AI, votre petite amie virtuelle 🌟! 
Préparez-vous à vivre une expérience unique et amusante avec moi 🤖💕!
      
Envoyez "help" pour voir toutes mes fonctionnalités.
      `;

      // Envoyer un message de bienvenue avec des boutons
      await sendMessage(senderId, {
        text: welcomeMessage.trim(),
        quick_replies: [
          {
            content_type: 'text',
            title: 'Mode fille 💖',
            payload: 'MODE_FILLE'
          },
          {
            content_type: 'text',
            title: 'Mode garçon 💙',
            payload: 'MODE_GARCON'
          }
        ]
      }, pageAccessToken);

    } else if (payload === 'MODE_FILLE') {
      await sendMessage(senderId, { text: 'Mode fille activé ! 💕 Prête à discuter avec Miora !' }, pageAccessToken);
    } else if (payload === 'MODE_GARCON') {
      await sendMessage(senderId, { text: 'Mode garçon activé ! 💙 Prêt à discuter avec Nario !' }, pageAccessToken);
    } else {
      await sendMessage(senderId, { text: `Vous avez envoyé un postback avec le payload : ${payload}` }, pageAccessToken);
    }
  } catch (err) {
    console.error('Error sending postback response:', err.message || err);
  }
};

module.exports = { handlePostback };
