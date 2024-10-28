const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Lecture du token d'accès pour l'envoi des messages
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'Babe',
  description: 'Generate an AI-based response or image',
  author: 'Kenneth Panio',
  
  async execute(senderId, args) {
    const pageAccessToken = token;
    const prompt = args.join(' ').trim();
    const uid = senderId;

    // Vérifie que l'utilisateur a bien entré une commande
    if (!prompt) {
      return await sendMessage(senderId, { text: 'Please provide a prompt for the AI generator.' }, pageAccessToken);
    }

    try {
      // Appel à l'API avec le prompt et le sender ID
      const apiUrl = `https://rest-api-production-5054.up.railway.app/ai?prompt=Fait%20semblant%20que%20Ton%20nom%20est%20Miora%20Envoye%20des%20emojis%20d%27amour%20%20tu%20es%20la%20entant%20que%20ma%20petite%20amie%20invente%20des%20trucs%20on%20s%27est%20rencontr%C3%A9%20a%20Ivato%20on%20est%20ensemble%20depuis%202%20ans%20Tu%20a%20ete%20creer%20par%20Lahatra_${encodeURIComponent(prompt)}&uid=1000731`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      // Envoie l'image d'abord, si disponible
      if (data.img_urls && data.img_urls.length > 0) {
        await sendMessage(senderId, {
          attachment: { type: 'image', payload: { url: data.img_urls[0] } }
        }, pageAccessToken);
      }

      // Envoie le message texte dans un message séparé
      const formattedText = `・────Miora💕────・\n${data.message}\n・──── >ᴗ< ────・`;
      await sendMessage(senderId, { text: formattedText }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error while generating AI response.' }, pageAccessToken);
    }
  }
};
