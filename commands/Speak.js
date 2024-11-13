const { speak } = require('google-translate-api-x');
const { writeFileSync, createReadStream } = require('fs');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Lecture du token d'accès à partir d'un fichier
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'speak', // Nom de la commande
  description: 'Convertir un texte en audio avec Google Translate',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const text = (args.join(' ') || 'Bonjour').trim();
    const language = 'fr'; // Tu peux changer la langue par défaut ici

    try {
      // Générer l'audio à partir du texte
      const res = await speak(text, { to: language });
      
      // Enregistrer le fichier audio en MP3
      const audioFileName = 'audio.mp3';
      writeFileSync(audioFileName, res, { encoding: 'base64' });

      // Envoyer le fichier audio en utilisant le bot Messenger
      const audioData = createReadStream(audioFileName);
      const messageData = {
        messaging_type: 'RESPONSE',
        recipient: { id: senderId },
        message: {
          attachment: {
            type: 'audio',
            payload: {}
          }
        },
        filedata: audioData,
      };

      // Faire une requête POST pour envoyer le fichier audio
      const formData = {
        recipient: JSON.stringify({ id: senderId }),
        message: JSON.stringify({
          attachment: {
            type: 'audio',
            payload: {},
          }
        }),
        filedata: audioData,
      };

      const axios = require('axios');
      const form = require('form-data');
      const formInstance = new form();
      formInstance.append('recipient', formData.recipient);
      formInstance.append('message', formData.message);
      formInstance.append('filedata', audioData);

      await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`, formInstance, {
        headers: {
          ...formInstance.getHeaders(),
        }
      });

    } catch (error) {
      console.error('Erreur lors de la conversion en audio:', error);

      // Envoyer un message d'erreur en cas de problème
      await sendMessage(senderId, { text: 'Désolé, une erreur est survenue lors de la génération du fichier audio.' }, pageAccessToken);
    }
  }
};
