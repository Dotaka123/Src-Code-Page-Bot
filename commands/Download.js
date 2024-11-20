const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');
const adminId = '100039040104071';  // Remplace par l'ID de l'admin

module.exports = {
  name: 'admin',
  description: 'Envoyer un message anonyme à l\'admin',
  author: 'Tata',


  async execute(senderId, args) {
    const pageAccessToken = token;
    const message = args.join(' ').trim();

    // Vérifier si l'utilisateur a bien envoyé un message
    if (!message) {
      await sendMessage(senderId, { text: 'Tu dois écrire un message avant de l\'envoyer à l\'admin.' }, pageAccessToken);
      return;
    }

    try {
      // Formater le message anonyme
      const anonymousMessage = `Message anonyme de ${senderId} : ${message}`;

      // Envoi du message à l'admin
      await sendMessage(adminId, { text: anonymousMessage }, pageAccessToken);

      // Confirmer à l'utilisateur que le message a bien été envoyé
      await sendMessage(senderId, { text: 'Ton message a été envoyé à l\'admin en toute discrétion !' }, pageAccessToken);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      await sendMessage(senderId, { text: 'Désolé, il y a eu une erreur lors de l\'envoi de ton message.' }, pageAccessToken);
    }
  }
};
