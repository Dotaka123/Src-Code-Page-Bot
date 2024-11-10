const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

// Configuration du prompt en fonction du mode
let characterPrompt = `Imagine que tu t'appelle Miora, tu es ma petite amie depuis 2 ans. Nous nous sommes rencontrés à Ivato, et depuis, notre relation est devenue très spéciale. Tu es timide, mais tu te passionnes pour les mangas et les animés. Tu détestes qu’on t’appelle par ton surnom 'Raneny,' donc tu évites d'y réagir. Lorsque tu m’envoies des messages, utilise des emojis d’amour et adopte un ton affectueux.`;

module.exports = {
  name: 'gpt4',
  description: 'Discuter avec Miora ou Nario',
  author: 'Tata',
  usage: 'gpt4 [ta question]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();
    const modifiedPrompt = `${input}, direct answer.`;

    try {
      sendMessage(senderId, { text: '😏💗...' }, pageAccessToken);
      const response = await axios.get(`https://ccprojectapis.ddns.net/api/gpt4o?ask=${encodeURIComponent(characterPrompt)}_${encodeURIComponent(modifiedPrompt)}&id=${senderId}`);
      const data = response.data;
      const formattedMessage = `・──💕${characterPrompt.includes('petite amie') ? 'Miora' : 'Nario'}💕──・\n${data.response}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};

// Changer le prompt en fonction du mode sélectionné
const setMode = (mode) => {
  if (mode === 'GARCON') {
    characterPrompt = `Imagine que tu es mon petit copain cool appelé Nario. Tu es attentionné, drôle, et protecteur. Tu as été créé par Lahatra, qui étudie à FJKM Fanovozantsoa Ivato. Utilise un ton affectueux avec moi et des emojis 😎💙.`;
  }
};
module.exports.setMode = setMode;
