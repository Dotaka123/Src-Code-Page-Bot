const axios = require('axios');
const cheerio = require('cheerio');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tononkira',
  description: 'Recherche des paroles de chansons malgaches',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(' ').trim();
    if (!query) {
      await sendMessage(senderId, { text: 'Veuillez fournir le titre ou l\'artiste de la chanson.' }, pageAccessToken);
      return;
    }

    const baseUrl = 'https://tononkira.serasera.org/tononkira';

    // Fonction pour scraper la liste des chansons
    async function scrapList(data) {
      const resValue = [];
      const rows = data.find('tbody tr');
      rows.each((index, row) => {
        const columns = cheerio(row).find('td');
        resValue.push({
          title: columns.eq(1).text(),
          artist: columns.eq(2).text(),
          url: columns.eq(1).find('a').attr('href')
        });
      });
      return resValue;
    }

    // Fonction pour rechercher une chanson
    async function searchSong(query) {
      try {
        const response = await axios.post(`${baseUrl}/hira/results`, null, {
          params: { 'filter[tadiavo]': query }
        });
        const $ = cheerio.load(response.data);
        const table = $('table.list');
        if (!table.length) return [];
        return scrapList(table);
      } catch (error) {
        console.error('Erreur lors de la recherche :', error);
        return [];
      }
    }

    // Fonction pour récupérer les paroles d'une chanson
    async function fetchLyrics(url) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const title = $('h1').text();
        const lyrics = [];
        let isContent = false;

        // Récupérer les paroles
        $('div.adminbox').nextAll().each((_, el) => {
          if (cheerio(el).is('div')) return false;
          const text = cheerio(el).text();
          if (text) lyrics.push(text.replace('tononkira.serasera.org', '').trim());
        });

        return `${title}\n-------------\n\n${lyrics.join('\n').trim()}`;
      } catch (error) {
        console.error('Erreur lors de la récupération des paroles :', error);
        return 'Impossible de récupérer les paroles de la chanson.';
      }
    }

    try {
      // Rechercher la chanson
      const results = await searchSong(query);
      if (results.length === 0) {
        await sendMessage(senderId, { text: 'Aucun résultat trouvé.' }, pageAccessToken);
        return;
      }

      // Récupérer les paroles de la meilleure correspondance
      const songUrl = results[0].url ? `${baseUrl}${results[0].url}` : '';
      const lyrics = await fetchLyrics(songUrl);

      // Envoyer les paroles
      await sendMessage(senderId, { text: lyrics }, pageAccessToken);
    } catch (error) {
      console.error('Erreur générale :', error);
      await sendMessage(senderId, { text: 'Erreur lors de la recherche des paroles.' }, pageAccessToken);
    }
  }
};
