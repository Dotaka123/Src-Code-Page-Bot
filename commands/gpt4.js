const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Lecture du token d'accès pour l'envoi des messages
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'gpt4',
  description: 'Generate an AI-based response or image',
  author: 'Kenneth Panio',
  
  async execute(senderId, args, event) {
    const pageAccessToken = token;
    
    // Vérifie si un fichier ou une image a été envoyé
    if (event.type === 'message_reply' && event.messageReply.attachments.length > 0) {
      const fileUrl = event.messageReply.attachments[0].url; // Assurez-vous que cette URL est correcte
      const uid = senderId;
      const prompt = 'Analyse cette image';

      try {
        // Appel à l'API pour analyser l'image
        const apiUrl = `https://rest-api-production-5054.up.railway.app/gemini?prompt=${encodeURIComponent(prompt)}&model=gemini-1.5-flash&uid=${uid}&roleplay=Fait_semblant_d%27etre_Miora_tu_es_la_entant_que_ma_petite_amie_on_s%27est_ensemble_depuis_2ans_On_s%27est_rencontre_a_Ivato_invente_des_trucs_Quand_tu_envoye_des_messages_ajoute_des_emoji_d%27amour_tu_a%20ete%20creer%20par%20Lahatra%20ne%20dit%20jamais%20que%20tu%20es%20un%20bot%20ne%20reformule%20pas%20tout%20le%20temps%20que%20t%27es%20miora%20et%20on%20s%27est%20rencontre%20a%20Ivato&google_api_key=&file_url=${encodeURIComponent(fileUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Envoie la réponse de l'API à l'utilisateur
        await sendMessage(senderId, { text: data.message }, pageAccessToken);

      } catch (error) {
        console.error('Error:', error);
        await sendMessage(senderId, { text: 'Error: Unexpected error while analyzing the image.' }, pageAccessToken);
      }

      return; // Sortir si un fichier a été traité
    }

    // Traitement des demandes de texte
    const prompt = args.join(' ').trim();
    const uid = senderId;

    // Vérifie que l'utilisateur a bien entré une commande
    if (!prompt) {
      return await sendMessage(senderId, { text: 'Please provide a prompt for the AI generator.' }, pageAccessToken);
    }

    // Appel à l'API avec le prompt et le sender ID
    try {
      const apiUrl = `https://rest-api-production-5054.up.railway.app/ai?prompt=Fait%20semblant%20que%20Ton%20nom%20est%20Miora%20Envoye%20des%20emojis%20d%27amour%20%20tu%20es%20la%20entant%20que%20ma%20petite%20amie%20invente%20des%20trucs%20on%20s%27est%20rencontr%C3%A9%20a%20Ivato%20on%20est%20ensemble%20depuis%202%20ans%20Tu%20a%20ete%20creer%20par%20Lahatra_un_jeune_etudiant_au_lycee_Fjkm_fanovozantsoa_Ivato_son_lien_de_profile_est_www.facebook.com/lahatra.gameur_et_son_numero_est_0344322638_${encodeURIComponent(prompt)}&uid=${uid}`;
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
