const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tononkira',
  description: 'Rechercher des paroles de chansons malgaches',
  author: 'Tata',
  usage: 'tononkira [nom artiste] ou tononkira [titre chanson]',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (args.length === 0) {
      await sendMessage(senderId, { text: 'Veuillez entrer le nom d’un artiste ou le titre d’une chanson.' }, pageAccessToken);
      return;
    }

    const query = args.join(' ').trim();

    if (!this.lastArtist) {
      this.lastArtist = query;
      await sendMessage(senderId, { text: 'Entrez maintenant le titre de la chanson.' }, pageAccessToken);
      return;
    }

    const artist = this.lastArtist;
    const title = query;
    this.lastArtist = null; // Réinitialise après réception du titre

    try {
      const encodedParams = new URLSearchParams();
      encodedParams.set('url', `https://tononkira.serasera.org/hira/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);

      const options = {
        method: 'POST',
        url: 'https://tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com/infos_two_hira',
        headers: {
          'x-rapidapi-key': 'bf6b729bbdmshb9d8e92ca0fc1cep191fbfjsn71acd0cb1e97',
          'x-rapidapi-host': 'tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: encodedParams,
      };

      await sendMessage(senderId, { text: '🔍 Recherche en cours...' }, pageAccessToken);

      const response = await axios.request(options);
      const data = response.data;

      if (!data || !data.lyrics || data.lyrics.length === 0) {
        await sendMessage(senderId, { text: `Paroles introuvables pour "${title}" de "${artist}".` }, pageAccessToken);
        return;
      }

      const lyricsMessage = `🎵 *${data.title}* - *${data.artist}*\n\n${data.lyrics.join('\n')}`;
      await sendMessage(senderId, { text: lyricsMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Erreur : Impossible de récupérer les paroles.' }, pageAccessToken);
    }
  },
};
