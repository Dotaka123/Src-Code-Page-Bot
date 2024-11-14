const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const Optiic = require('optiic');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'extract-text',
  description: 'Extraire le texte d\'une image ou PDF quand l\'utilisateur répond avec un préfixe',
  author: 'Tata',

  execute(senderId, message, attachments) {
    const pageAccessToken = token;
    const apiKey = 'api_test_key'; // Remplace par ta clé API Optiic si tu en as une
    const optiic = new Optiic({ apiKey });
    const prefix = '!extract'; // Le préfixe que l'utilisateur doit utiliser

    // Vérifier si l'utilisateur a répondu à un message précédent
    if (!message.reply_to || !message.reply_to.attachments || !message.text.startsWith(prefix)) {
      return; // Ne rien faire si aucune réponse à un message ou préfixe incorrect
    }

    // Extraire l'URL de l'image à partir du message auquel l'utilisateur a répondu
    const repliedAttachments = message.reply_to.attachments;
    if (!repliedAttachments.length || repliedAttachments[0].type !== 'image') {
      sendMessage(senderId, { text: 'Le message auquel vous avez répondu ne contient pas d\'image.' }, pageAccessToken);
      return;
    }

    const imageUrl = repliedAttachments[0].payload.url;
    let options = {
      image: imageUrl,
      mode: 'ocr', // Pour extraire le texte
    };

    // Traiter l'image avec l'API Optiic
    optiic.process(options)
      .then(result => {
        if (result.text && result.text.trim().length > 0) {
          const formattedMessage = `・─── Texte Extrait ───・\n${result.text}\n・──── >ᴗ< ────・`;
          sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
        } else {
          sendMessage(senderId, { text: 'Aucun texte détecté dans l\'image.' }, pageAccessToken);
        }
      })
      .catch(error => {
        console.error('Erreur:', error);
        sendMessage(senderId, { text: 'Une erreur s\'est produite lors de l\'extraction du texte.' }, pageAccessToken);
      });
  },
};
