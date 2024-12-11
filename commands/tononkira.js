const qs = require('querystring');
const http = require('https');
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
    const url = `https://tononkira.serasera.org/hira/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

    const options = {
      method: 'POST',
      hostname: 'tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com',
      path: '/infos_two_hira',
      headers: {
        'x-rapidapi-key': 'bf6b729bbdmshb9d8e92ca0fc1cep191fbfjsn71acd0cb1e97',
        'x-rapidapi-host': 'tononkira-tononkalo-ohabolana-malagasy.p.rapidapi.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = http.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', async () => {
        const body = Buffer.concat(chunks);
        const result = JSON.parse(body.toString());

        if (result && result.lyrics && result.lyrics.length > 0) {
          let formattedLyrics = result.lyrics.join('\n');
          const maxLength = 2000; // Limite de caractères par message

          // Diviser le message en plusieurs si nécessaire
          let start = 0;
          while (start < formattedLyrics.length) {
            let end = start + maxLength;
            const messagePart = formattedLyrics.slice(start, end);
            await sendMessage(senderId, { text: messagePart }, pageAccessToken);
            start = end;
          }
        } else {
          await sendMessage(senderId, { text: '❌ Paroles introuvables pour cette chanson.' }, pageAccessToken);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      sendMessage(senderId, { text: '❌ Une erreur s\'est produite lors de la recherche des paroles.' }, pageAccessToken);
    });

    req.write(qs.stringify({ url }));
    req.end();
  }
};
