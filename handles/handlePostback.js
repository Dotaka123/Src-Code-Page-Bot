const { sendMessage } = require('./sendMessage');
const axios = require('axios');

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
      Admin: www.facebook.com/lahatra.gameur
      `;

      await sendMessage(senderId, { text: welcomeMessage.trim() }, pageAccessToken);
    } 
    // Check if the payload is for listening to audio
    else if (payload.startsWith('LISTEN_AUDIO_')) {
      const videoId = payload.split('_')[2];
      const downloadUrl = `https://api-improve-production.up.railway.app/yt/download?url=https://www.youtube.com/watch?v=${videoId}&format=mp3&quality=180`;

      try {
        // Make a HEAD request to get the file size
        const headResponse = await axios.head(downloadUrl);
        const fileSize = headResponse.headers['content-length'];

        // Check if the file size exceeds 25 MB (25,000,000 bytes)
        if (fileSize && parseInt(fileSize, 10) > 25000000) {
          await sendMessage(senderId, { text: "Fichier trop volumineux pour être envoyé." }, pageAccessToken);
        } else {
          // Send the audio file if it's under the size limit
          const downloadResponse = await axios.get(downloadUrl);
          const audioUrl = downloadResponse.data.audio;

          await sendMessage(senderId, {
            attachment: {
              type: "audio",
              payload: { url: audioUrl }
            }
          }, pageAccessToken);
        }
      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'audio:', error);
        await sendMessage(senderId, { text: "Erreur lors du téléchargement de l'audio." }, pageAccessToken);
      }
    } 
    // For other postback payloads, send a default response
    else {
      await sendMessage(senderId, { text: `Vous avez envoyé un postback avec le payload : ${payload}` }, pageAccessToken);
    }
  } catch (err) {
    console.error('Error sending postback response:', err.message || err);
  }
};

module.exports = { handlePostback };
