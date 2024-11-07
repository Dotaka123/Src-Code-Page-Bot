const { sendMessage } = require('./sendMessage');

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    return console.error('Invalid postback event object');
  }

  try {
    // Check if the payload is 'GET_STARTED' to send a welcome message
    if (payload === 'GET_STARTED') {
      await sendMessage(senderId, { text: 'Bienvenue sur notre bot ! /n Envoyez [help] pour voir les commandes du bot /n Pour soutenir le bot,contactez l admin www.facebook.com/lahatra.gameur /n Ou Envoyer par Mvola (0344322638)' }, pageAccessToken);
    } else {
      // For other postback payloads, send a default response
      await sendMessage(senderId, { text: `Vous avez envoyé un postback avec le payload : ${payload}` }, pageAccessToken);
    }
  } catch (err) {
    console.error('Error sending postback response:', err.message || err);
  }
};

module.exports = { handlePostback };
