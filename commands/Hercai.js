const { Hercai } = require('hercai');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Lecture du token d'accès à partir d'un fichier
const token = fs.readFileSync('token.txt', 'utf8');

// Initialisation de Hercai
const herc = new Hercai();

module.exports = {
  name: 'hercai', // Nom de la commande
  description: 'Répondre aux questions avec Hercai AI',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'Bonjour!').trim();

    try {
      sendMessage(senderId, { text: '...✍🏻' }, pageAccessToken);
      // Appel de l'API Hercai avec le modèle "v3"
      const response = await herc.question({
        model: "v3", // Tu peux changer le modèle si nécessaire
        content: input
      });

      // Extraction de la réponse de l'API
      const aiReply = response.reply;

      // Format du message à envoyer
      const formattedMessage = `・────🤖Hercai🤖────・\n${aiReply}\n・───────────────・`;

      // Envoi de la réponse à l'utilisateur
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Erreur avec Hercai API:', error);

      // Message d'erreur envoyé en cas de problème
      await sendMessage(senderId, { text: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.' }, pageAccessToken);
    }
  }
};
