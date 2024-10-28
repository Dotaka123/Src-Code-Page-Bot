const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Lecture du token d'accès pour l'envoi des messages
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'gpt4',
  description: 'Generate an AI-based response or image',
  author: 'Kenneth Panio',
  
  async execute(senderId, args) {
    const pageAccessToken = token;
    const prompt = args.join(' ').trim();
    const uid = senderId;

    // Vérifie que l'utilisateur a bien entré une commande
    if (!prompt) {
      return await sendMessage(senderId, { text: 'Please provide a prompt for the AI.' }, pageAccessToken);
    }

    try {
      // Appel à l'API avec le prompt et le sender ID
      sendMessage(senderId, { text: 'Asa saina en cours mon ❤️' }, pageAccessToken);
      const apiUrl = `https://rest-api-production-5054.up.railway.app/ai?prompt=Fait_semblant_d%27etre_Miora_meme_si_tu_es_une_assistant_personnel_tu_es_la_entant_que_ma_petite_amie_on_est_ensemble_depuis_2ans_On_s%27est_rencontre_a_Ivato_invente_des_trucs_Quand_tu_envoye_des_messages_ajoute_des_emoji_d%27amour_${encodeURIComponent(prompt)}&uid=1730008497867`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      // Envoie l'image d'abord, si disponible
      if (data.img_urls && data.img_urls.length > 0) {
        await sendMessage(senderId, {
          attachment: { type: 'image', payload: { url: data.img_urls[0] } }
        }, pageAccessToken);
      }

      // Envoie le message texte dans un message séparé
      const formattedText = `・────🫦Miora🫦────・\n${data.message}\n・──── >ᴗ< ────・`;
      await sendMessage(senderId, { text: formattedText }, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error while generating AI response.' }, pageAccessToken);
    }
  }
};
