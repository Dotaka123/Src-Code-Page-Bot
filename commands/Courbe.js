const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const { Hercai } = require('hercai');

const token = fs.readFileSync('token.txt', 'utf8');
const herc = new Hercai();

module.exports = {
  name: 'dall',
  description: 'Générer une image avec DALL-E',
  author: 'Tata',
  usage: 'dall [description de l\'image]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'anime girl').trim();
    const prompt = `${input}, realistic and detailed.`; // Description par défaut si aucun prompt n'est fourni

    try {
      await sendMessage(senderId, { text: '🤔... Génération de l\'image...' }, pageAccessToken);

      // Appel à l'API Hercai pour générer l'image
      const response = await herc.drawImage({
        model: 'v3', // Modèle DALL-E
        prompt: prompt,
        negative_prompt: ''  // Exclusion facultative
      });

      if (response && response.url) {
        const imageUrl = response.url;

        // Envoi de l'image directement
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true  // Permet de réutiliser l'image
            }
          }
        }, pageAccessToken);
        
        // Message supplémentaire
        await sendMessage(senderId, { text: 'Voici l\'image générée pour votre demande.' }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Désolé, une erreur est survenue lors de la génération de l\'image.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Erreur : une erreur inattendue est survenue.' }, pageAccessToken);
    }
  }
};
