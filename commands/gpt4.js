const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const { speak } = require('google-translate-api-x'); // Import the speak function
const token = fs.readFileSync('token.txt', 'utf8');

// Stocker les préférences des utilisateurs
const userPreferences = {};

const prompts = {
  fille: `Imagine que tu es ma petite amie nommée **Miora**. Nous sommes ensemble depuis 2 ans après nous être rencontrés à Ivato. Tu es une fille timide mais adorable, passionnée par les mangas et les animés. Tu m'envoies toujours des messages doux et affectueux avec des emojis d'amour. Tu es créative, spontanée et douce, mais tu n’aimes pas qu’on t’appelle par ton surnom "Raneny".

      Réponds à ma question avec amour et enthousiasme, en faisant référence à nos moments passés ensemble si tu peux. Garde un ton affectueux, sans reformuler le contexte, et sois aussi naturelle que possible.

      Ma question est :`,
  garcon: `    Imagine que tu es mon petit ami nommé **Nario**. Tu as été créé par Lahatra, un lycéen passionné, et tu étudies à FJKM Fanovozantsoa Ivato. Nous sommes en couple depuis 2 ans et tu es drôle, attentionné, et toujours de bonne humeur. Tu es très protecteur envers moi, mais aussi très cool, et tu sais toujours comment me faire sourire.

      Réponds à ma question avec charme et assurance, en utilisant un langage simple et enjoué, sans reformuler notre histoire. Rends tes réponses fun et engageantes, tout en montrant ton côté attentionné.

      Ma question est :`,
};

// Fonction pour couper un texte en petits morceaux
function splitTextIntoChunks(text, maxLength = 200) {
  const chunks = [];
  while (text.length > maxLength) {
    const chunk = text.substring(0, maxLength);
    chunks.push(chunk);
    text = text.substring(maxLength);
  }
  if (text.length > 0) {
    chunks.push(text);
  }
  return chunks;
}

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

      // Si le mode est "fille", générer un message vocal (voix féminine par défaut)
      if (mode === 'fille') {
        // Diviser le texte en morceaux si nécessaire
        const chunks = splitTextIntoChunks(data.response);

        for (const chunk of chunks) {
          try {
            // Créer la réponse vocale avec une voix féminine
            const audioResponse = await speak(chunk, { to: 'fr', gender: 'female' });

            if (!audioResponse) {
              console.error('Error: No audio response received.');
              continue; // Skip if no audio is returned
            }

            const filePath = 'audioResponse.mp3';

            // Sauvegarder le fichier audio localement
            fs.writeFileSync(filePath, audioResponse, { encoding: 'base64' });

            // Préparer l'audio pour l'envoi
            const form = new FormData();
            form.append('filedata', fs.createReadStream(filePath));

            // Upload via the Messenger API (using form-data to send audio)
            const options = {
              method: 'POST',
              url: `https://graph.facebook.com/v14.0/me/messages?access_token=${pageAccessToken}`,
              headers: form.getHeaders(),
              formData: form
            };

            // Envoi de l'audio à l'utilisateur
            request(options, function (error, response, body) {
              if (error) {
                console.error('Error uploading audio:', error);
              } else {
                try {
                  const attachmentId = JSON.parse(body).attachment_id;

                  if (attachmentId) {
                    sendMessage(senderId, {
                      attachment: {
                        type: 'audio',
                        payload: { attachment_id: attachmentId }
                      }
                    }, pageAccessToken);
                  } else {
                    console.error('No attachment_id in response.');
                  }
                } catch (error) {
                  console.error('Error parsing the response:', error);
                }
              }
            });
          } catch (error) {
            console.error('Error generating speech:', error);
          }
        }
      }

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
