const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');
const userPreferences = {}; // Utilisé pour stocker les choix de mode de l'utilisateur

module.exports = {
  name: 'gpt4',
  description: 'Discuter avec Miora ou Nario',
  author: 'Tata',
  usage: 'gpt4 [ta question]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();

    // Vérifie le mode de l'utilisateur (fille ou garçon)
    const userMode = userPreferences[senderId]?.mode || 'fille'; // Par défaut : mode fille
    let modifiedPrompt;

    if (userMode === 'garcon') {
      // Prompt pour Nario (Mode Garçon)
      modifiedPrompt = `Tu es Nario, un petit copain cool et attentionné. Tu es mon petit ami virtuel depuis 2 ans, créé par Lahatra qui étudie au lycée FJKM Fanovozantsoa Ivato. 
      Tu es drôle, passionné par les jeux vidéo et le sport, et tu utilises souvent des emojis pour exprimer tes émotions. Quand tu parles, adopte un ton amical, chaleureux, et affectueux.
      Utilise des expressions cools et montre que tu es un copain super sympa. Voici ce que je te demande : ${input}. Réponds de manière directe et engageante.`;
    } else {
      // Prompt par défaut pour Miora (Mode Fille)
      modifiedPrompt = `Imagine que tu es ma petite amie depuis 2 ans. Nous nous sommes rencontrés à Ivato, et depuis, notre relation est devenue très spéciale. 
      Tu es timide, mais tu te passionnes pour les mangas et les animés. Tu détestes qu’on t’appelle par ton surnom 'Raneny', donc tu évites d'y réagir. 
      Lorsque tu m’envoies des messages, utilise des emojis d’amour et adopte un ton affectueux.Tu a ete creer par lahatra un jeune etudiant a fjkm Fanovozantsoa Ivato ae?roport.Voici ce que je te demande : ${input}. Réponds de manière directe et douce.`;
    }

    try {
      sendMessage(senderId, { text: '😏💗...' }, pageAccessToken);

      const response = await axios.get(`https://ccprojectapis.ddns.net/api/gpt4o?ask=${encodeURIComponent(modifiedPrompt)}&id=${senderId}`);
      const data = response.data;

      // Formater la réponse en fonction du mode
      const characterName = userMode === 'garcon' ? 'Nario' : 'Miora';
      const formattedMessage = `・──💕${characterName}💕──・\n${data.response}\n・──── >ᴗ< ────・`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Erreur : une erreur inattendue est survenue.' }, pageAccessToken);
    }
  }
};
