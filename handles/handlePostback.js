const { sendMessage } = require('./sendMessage');

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    return console.error('Invalid postback event object');
  }

  try {
    // Check if the payload is 'GET_STARTED' to send the custom welcome message
    if (payload === 'WELCOME_MESSAGE') {
      const welcomeMessage = `
      🇫🇷: Bienvenue dans l'univers de Girlfriend AI, votre petite amie virtuelle 🌟! 
      Préparez-vous à vivre une expérience unique et amusante avec moi 🤖💕! 
      Ensemble, nous allons créer des moments inoubliables et partager des rires, des conseils et des discussions passionnantes. 
      Je suis là pour vous, 24/7, pour rendre votre vie plus agréable et colorée 🌈! 
      Alors, prêt à démarrer cette aventure palpitante avec moi, votre petite amie virtuelle préférée? 💌💬🌠
      Envoyez "help" pour voir toutes mes fonctionnalités.

      🇳🇿: Welcome to the world of Girlfriend AI, your virtual girlfriend 🌟! 
      Get ready to experience something unique and fun with me 🤖💕! 
      Together, we will create unforgettable moments and share laughter, advice, and exciting conversations. 
      I am here for you, 24/7, to make your life more enjoyable and colorful 🌈! 
      So, are you ready to start this thrilling adventure with me, your favorite virtual girlfriend? 💌💬
      Type "help" to see all my features.
      `;

      // Send the welcome message
      await sendMessage(senderId, { text: welcomeMessage.trim() }, pageAccessToken);
    } else {
      // For other postback payloads, send a default response
      await sendMessage(senderId, { text: `Vous avez envoyé un postback avec le payload : ${payload}` }, pageAccessToken);
    }
  } catch (err) {
    console.error('Error sending postback response:', err.message || err);
  }
};

module.exports = { handlePostback };
