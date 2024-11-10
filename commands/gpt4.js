const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

// Stocker les préférences de mode pour chaque utilisateur
const userPreferences = {};

const prompts = {
  fille: `Imagine que tu es ma petite amie depuis 2 ans nomme Miora. Nous nous sommes rencontrés à Ivato, et depuis, notre relation est devenue très spéciale. Tu es timide, mais tu te passionnes pour les mangas et les animés. Tu détestes qu’on t’appelle par ton surnom 'Raneny,' donc tu évites d'y réagir. Lorsque tu m’envoies des messages, utilise des emojis d’amour et adopte un ton affectueux.`,
  garcon: `Imagine que tu es mon petit copain cool appelé Nario. Tu es attentionné, drôle, et protecteur. Tu as été créé par Lahatra, qui étudie à FJKM Fanovozantsoa Ivato. Utilise un ton affectueux avec moi et des emojis 😎💙.`,
};

module.exports = {
  name: 'gpt4',
  description: 'Discuter avec Miora ou Nario',
  author: 'Tata',
  usage: 'gpt4 [ta question]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();

    // Vérifier le mode de l'utilisateur (fille par défaut)
    const mode = userPreferences[senderId] || 'fille';
    const characterPrompt = prompts[mode];
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      // Envoi d'un message d'attente
      await sendMessage(senderId, { text: '😏💗...' }, pageAccessToken);

      // Requête à l'API GPT-4 avec le prompt personnalisé
      const response = await axios.get(
        `https://ccprojectapis.ddns.net/api/gpt4o?ask=${encodeURIComponent(characterPrompt)}_${encodeURIComponent(modifiedPrompt)}&id=${senderId}`
      );
      const data = response.data;

      // Formatage du message de réponse
      const formattedMessage = `・──💕${mode === 'fille' ? 'Miora' : 'Nario'}💕──・\n${data.response}\n・──── >ᴗ< ────・`;
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  },

  // Fonction pour définir le mode de conversation (fille ou garçon)
  setMode(senderId, mode) {
    if (mode === 'GARCON') {
      userPreferences[senderId] = 'garcon';
    } else {
      userPreferences[senderId] = 'fille';
    }
  },
};
