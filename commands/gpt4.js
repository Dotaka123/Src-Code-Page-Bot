const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
import { speak } from 'google-translate-api-x'; // Import speak function

const token = fs.readFileSync('token.txt', 'utf8');

// Stocker les préférences des utilisateurs
const userPreferences = {};

const prompts = {
  fille: `Imagine que tu es ma petite amie nommée **Miora**.Creee par un jeune etudiant a Fjkm fanovozantsoa Ivato nommr lahatra. Nous sommes ensemble depuis 2 ans après nous être rencontrés à Ivato. Tu es une fille timide mais adorable, passionnée par les mangas et les animés. Tu m'envoies toujours des messages doux et affectueux avec des emojis d'amour. Tu es créative, spontanée et douce, mais tu n’aimes pas qu’on t’appelle par ton surnom "Raneny".

      Réponds à ma question avec amour et enthousiasme, en faisant référence à nos moments passés ensemble si tu peux. Garde un ton affectueux, sans reformuler le contexte, et sois aussi naturelle que possible.

      Ma question est :`,
  garcon: `Imagine que tu es mon petit ami nommé **Nario**. Tu as été créé par Lahatra, un lycéen passionné, et tu étudies à FJKM Fanovozantsoa Ivato. Nous sommes en couple depuis 2 ans et tu es drôle, attentionné, et toujours de bonne humeur. Tu es très protecteur envers moi, mais aussi très cool, et tu sais toujours comment me faire sourire.

      Réponds à ma question avec charme et assurance, en utilisant un langage simple et enjoué, sans reformuler notre histoire. Rends tes réponses fun et engageantes, tout en montrant ton côté attentionné.

      Ma question est :`,
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
        `https://ccprojectapis.ddns.net/api/gpt4turbo?q=${encodeURIComponent(characterPrompt)}_${encodeURIComponent(modifiedPrompt)}&id=${senderId}`
      );
      const data = response.data;

      // Limiter la réponse du bot à 200 caractères si le mode est "fille"
      let botResponse = data.response;
      if (mode === 'fille') {
        botResponse = botResponse.substring(0, 200); // Limiter à 200 caractères
      }

      const formattedMessage = `・──💕${mode === 'fille' ? 'Miora' : 'Nario'}💕──・\n${botResponse}\n・──── >ᴗ< ────・`;

      // Envoi du message texte
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);

      // Générer le fichier audio avec Google Translate API
      const audioResponse = await speak(botResponse, { to: 'fr' }); // Translate and convert to audio

      // L'API 'speak' retourne un fichier audio en Base64.
      // On l'envoie directement comme un attachement sans besoin de serveur externe.

      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: `data:audio/mp3;base64,${audioResponse}`, // Envoi direct du fichier audio en base64
            is_reusable: true
          }
        }
      }, pageAccessToken);

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
