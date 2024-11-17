const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fonction pour extraire la liste des chansons à partir du HTML
 */
async function scrapList(htmlString) {
  const $ = cheerio.load(htmlString);
  const data = [];

  $(".list tbody tr td a").each((_i, el) => {
    const text = $(el).text();
    const link = $(el).attr('href');
    data.push({ text, link });
  });

  // Regrouper les résultats par 3 (titre, artiste, lien des paroles)
  return chunk(data, 3).map(el => ({
    title: el[0].text,
    artist: el[1].text,
    lyricsLink: el[0].link,
  }));
}

/**
 * Recherche par mot-clé
 */
async function search(query) {
  const url = `https://tononkira.serasera.org/tononkira?q=${query}`;
  try {
    const page = await axios.get(url);
    return await scrapList(page.data);
  } catch (err) {
    throw new Error(`Erreur lors de la recherche : ${err.message}`);
  }
}

/**
 * Fonction utilitaire pour regrouper des éléments par lot
 */
function chunk(array, size) {
  const chunked_arr = [];
  for (let i = 0; i < array.length; i += size) {
    chunked_arr.push(array.slice(i, i + size));
  }
  return chunked_arr;
}

module.exports = {
  search,
  scrapList,
};
