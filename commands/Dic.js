const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'dic',
  description: 'Gives the definition of a word',
  usage:'dic [ton mot]',

  async execute(senderId, args) {
    const word = args.join(' ').trim();  // Le mot entré par l'utilisateur
    const apiUrl = `https://ccprojectapis.ddns.net/api/dictio?q=${encodeURIComponent(word)}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status && data.meanings.length > 0) {
        // Formatage de la réponse à partir des données reçues
        const definition = data.meanings[0].definitions[0].definition; // Première définition
        const phonetic = data.phonetic;
        const audioUrl = data.phonetics[0]?.audio || '';

        const message = `Définition de "${word}":\nPhonétique: ${phonetic}\nAudio: ${audioUrl}\n\nDéfinition: ${definition}`;

        // Envoi du message formaté à l'utilisateur
        await sendMessage(senderId, { text: message });
      } else {
        // Message si le mot n'est pas trouvé
        await sendMessage(senderId, { text: `Aucune définition trouvée pour "${word}".` });
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Erreur : Impossible de récupérer la définition.' });
    }
  }
};
