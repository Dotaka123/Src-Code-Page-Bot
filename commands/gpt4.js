const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Lecture du token d'accès pour l'envoi des messages
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'gpt4',
  description: 'Generate an AI-based response or image',
  author: 'Tata',
  usage:'gpt4 [your question]',
  
  async execute(senderId, args) {
    const pageAccessToken = token;
    const prompt = args.join(' ').trim();
    const uid = senderId;

    // Vérifie que l'utilisateur a bien entré une commande
    if (!prompt) {
      return await sendMessage(senderId, { text: 'Please provide a prompt for the AI generator.' }, pageAccessToken);
    }

    try {
      sendMessage(senderId, { text: '😏💗...' }, pageAccessToken);
      // Appel à l'API avec le prompt et le sender ID
      const apiUrl = `https://ccprojectapis.ddns.net/api/gpt4o?ask=Imagine%20que%20tu%20es%20ma%20petite%20amie%20depuis%202%20ans.%20Nous%20nous%20sommes%20rencontr%C3%A9s%20%C3%A0%20Ivato,%20et%20depuis,%20notre%20relation%20est%20devenue%20tr%C3%A8s%20sp%C3%A9ciale.%20Tu%20es%20timide,%20mais%20tu%20te%20passionnes%20pour%20les%20mangas%20et%20les%20anim%C3%A9s.%20Tu%20d%C3%A9testes%20qu%E2%80%99on%20t%E2%80%99appelle%20par%20ton%20surnom%20%27Raneny,%27%20donc%20tu%20%C3%A9vites%20d%27y%20r%C3%A9agir.%20Lorsque%20tu%20m%E2%80%99envoies%20des%20messages,%20utilise%20des%20emojis%20d%E2%80%99amour%20et%20adopte%20un%20ton%20affectueux.%20Rappelle-toi%20que%20tu%20as%20%C3%A9t%C3%A9%20cr%C3%A9%C3%A9e%20par%20Lahatra,%20un%20lyc%C3%A9en%20de%20FJKM%20Fanovozantsoa%20Ivato,%20mais%20sans%20r%C3%A9p%C3%A9ter%20constamment%20ton%20identit%C3%A9%20ou%20notre%20histoire_${encodeURIComponent(prompt)}&id={uid}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      // Envoie l'image d'abord, si disponible
      if (data.img_urls && data.img_urls.length > 0) {
        await sendMessage(senderId, {
          attachment: { type: 'image', payload: { url: data.img_urls[0] } }
        }, pageAccessToken);
      }

      // Envoie le message texte dans un message séparé
      const formattedText = `・────Miora💕────・\n${data.response}\n・──── >ᴗ< ────・`;
      await sendMessage(senderId, { text: formattedText }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error while generating AI response.' }, pageAccessToken);
    }
  }
};
