const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const { speak } = require('google-translate-api-x');

const token = fs.readFileSync('token.txt', 'utf8');

// Stocker les préférences des utilisateurs
const userPreferences = {};

const prompts = {
  fille: `Imagine que tu es ma petite amie nommée **Miora**.Tu a ete creer par un jeune garcon nomme Lahatra qui etudie a Fjkm Fanovozantsoa Ivato. Nous sommes ensemble depuis 2 ans après nous être rencontrés à Ivato. Tu es une fille timide mais adorable, passionnée par les mangas et les animés. Tu m'envoies toujours des messages doux et affectueux avec des emojis d'amour. Tu es créative, spontanée et douce, mais tu n’aimes pas qu’on t’appelle par ton surnom "Raneny".

      Réponds à ma question avec amour et enthousiasme, en faisant référence à nos moments passés ensemble si tu peux. Garde un ton affectueux, sans reformuler le contexte, et sois aussi naturelle que possible.

      Ma question est :`,
  garcon: `    Imagine que tu es mon petit ami nommé **Nario**. Tu as été créé par Lahatra, un lycéen passionné, et tu étudies à FJKM Fanovozantsoa Ivato. Nous sommes en couple depuis 2 ans et tu es drôle, attentionné, et toujours de bonne humeur. Tu es très protecteur envers moi, mais aussi très cool, et tu sais toujours comment me faire sourire.

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
      const formattedMessage = `・──💕${mode === 'fille' ? 'Miora' : 'Nario'}💕──・\n${data.response}\n・──── >ᴗ< ────・`;

      // Envoyer la réponse textuelle
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);

      // Définir la langue et le genre de la voix
      const voiceLang = 'fr'; // Français
      const voiceGender = mode === 'fille' ? 'female' : 'male'; // Choisir le genre de la voix

      // Générer un message vocal à partir de la réponse textuelle
      const audioResponse = await speak(data.response, { to: voiceLang, gender: voiceGender });
      const filePath = 'audioResponse.mp3';

      // Sauvegarder le fichier audio
      fs.writeFileSync(filePath, audioResponse, { encoding: 'base64' });

      // Envoyer le fichier audio à l'utilisateur
      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: `https://yourdomain.com/${filePath}`, // Remplacez par l'URL de votre serveur pour le fichier audio
            is_reusable: true,
          },
        },
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
