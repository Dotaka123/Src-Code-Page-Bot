const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

// Stocker les préférences des utilisateurs
const userPreferences = {};

const prompts = {
  fille: `Imagine que tu es ma petite amie depuis 2 ans. Nous nous sommes rencontrés à Ivato, et depuis, notre relation est devenue très spéciale. Tu es timide, passionnée de mangas et animés, et tu utilises souvent des emojis d’amour. 💖`,
  garcon: `Imagine que tu es mon petit copain nommé Nario. Tu es cool, drôle, protecteur, et tu as été créé par Lahatra, un lycéen de FJKM Fanovozantsoa Ivato. Utilise des emojis 😎💙 et un ton amical avec moi.`,
};

module.exports = {
  name: 'gpt4',
  description: 'Discuter avec Miora ou Nario',
  author: 'Tata',
  usage: 'gpt4 [ta question]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();

    // Définir le mode utilisateur (fille par défaut)
    const mode = userPreferences[senderId] || 'fille';
    const characterPrompt = prompts[mode];
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      // Message d'attente
      await sendMessage(senderId, { text: '😏💗...' }, pageAccessToken);

      // Requête API avec le prompt personnalisé
      const response = await axios.get(
        `https://ccprojectapis.ddns.net/api/gpt4o?ask=${encodeURIComponent(characterPrompt)}_${encodeURIComponent(modifiedPrompt)}&id=${senderId}`
      );
      const data = response.data;
      const formattedMessage = `・──💕${mode === 'fille' ? 'Miora' : 'Nario'}💕──・\n${data.response}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  },

  // Fonction pour définir le mode utilisateur
  setUserMode(senderId, mode) {
    userPreferences[senderId] = mode;
  }
};
