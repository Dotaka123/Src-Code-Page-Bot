const axios = require('axios');
const cheerio = require('cheerio');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'apk',
  description: 'Recherche une application Android sur APKPure',
  author: 'Tata',

  async execute(senderId, args) {
    const query = args.join(' ');
    const pageAccessToken = require('fs').readFileSync('token.txt', 'utf8');

    if (!query) {
      return sendMessage(senderId, { text: '❗ Entrez le nom de l\'application à rechercher.' }, pageAccessToken);
    }

    try {
      const res = await axios.get(`https://apkpure.com/fr/search?q=${encodeURIComponent(query)}`);
      const $ = cheerio.load(res.data);
      const results = [];

      $('.search-dl .search-title a').each((i, el) => {
        const title = $(el).text().trim();
        const link = 'https://apkpure.com' + $(el).attr('href');
        const img = $(el).closest('.search-dl').find('img').attr('src');

        if (title && link) {
          results.push({ title, link, img });
        }
      });

      if (results.length === 0) {
        return sendMessage(senderId, { text: '❌ Aucune application trouvée.' }, pageAccessToken);
      }

      const app = results[0];

      await sendMessage(senderId, {
        text: `📱 *${app.title}*`,
        image: app.img,
        buttons: [
          {
            type: 'postback',
            title: '📥 Télécharger',
            payload: `DOWNLOAD_APK|${app.link}`
          }
        ]
      }, pageAccessToken);

    } catch (error) {
      console.error('Erreur lors de la recherche APK:', error.message);
      await sendMessage(senderId, { text: '❌ Erreur lors de la recherche de l\'application.' }, pageAccessToken);
    }
  }
};
