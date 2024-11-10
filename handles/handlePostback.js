const { sendMessage } = require('./sendMessage');

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    return console.error('Invalid postback event object');
  }

  try {
    // Vérifier si le payload est 'GET_STARTED' pour envoyer un message de bienvenue avec des quick replies
    if (payload === 'WELCOME_MESSAGE') {
      const welcomeMessage = `
🇫🇷: Bienvenue dans l'univers de Girlfriend AI 🌟!
Choisissez votre mode de conversation pour commencer :
      `;

      await sendMessage(senderId, {
        text: welcomeMessage.trim(),
        quickReplies: [
          { title: 'Mode fille 💖', payload: 'MODE_FILLE' },
          { title: 'Mode garçon 💙', payload: 'MODE_GARCON' }
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
