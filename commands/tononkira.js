const fetch = require('node-fetch');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tononkira',
  description: 'Chercher les paroles d\'une chanson malgache',
  author: 'Tata',
  usage: 'tononkira [nom artiste] [titre chanson]',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (args.length < 2) {
      await sendMessage(senderId, { text: 'Usage: tononkira [nom artiste] [titre chanson]' }, pageAccessToken);
      return;
    }

    const artist = args[0];
    const title = args.slice(1).join('-');

    const encodedParams = new URLSearchParams();
    encodedParams.set('url', `https://tononkira.serasera.org/hira/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);

    const url = 'https://tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com/infos_two_hira';
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': 'bf6b729bbdmshb9d8e92ca0fc1cep191fbfjsn71acd0cb1e97',
        'x-rapidapi-host': 'tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: encodedParams
    };

    try {
      await sendMessage(senderId, { text: '🔍 Recherche en cours...' }, pageAccessToken);

      const response = await fetch(url, options);
      const result = await response.json();

      if (result && result.lyrics && result.lyrics.length > 0) {
        const formattedLyrics = result.lyrics.join('\n');
        const formattedMessage = `🎶 **Titre** : ${result.title}\n👤 **Artiste** : ${result.artist}\n\n📜 **Paroles** :\n${formattedLyrics}`;

        await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: '❌ Paroles introuvables pour cette chanson.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: '❌ Une erreur s\'est produite lors de la recherche des paroles.' }, pageAccessToken);
    }
  }
};
