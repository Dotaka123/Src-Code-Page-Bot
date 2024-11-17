const axios = require('axios');
const cheerio = require('cheerio');

// Type de données pour les résultats
class IMusic {
  constructor(title, artist, lyricsLink) {
    this.title = title;
    this.artist = artist;
    this.lyricsLink = lyricsLink;
  }
}

// Fonction pour regrouper les éléments par lots
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// Fonction pour extraire les résultats de recherche à partir du HTML
async function scrapList(htmlString) {
  const $ = cheerio.load(htmlString);

  const data = [];
  $('.list tbody tr td a').each((_i, el) => {
    const text = $(el).text();
    const link = $(el).attr('href');
    data.push({ text, link });
  });

  // Le format des données est aplati, on les regroupe par 3
  return chunk(data, 3).map((el) => new IMusic(el[0].text, el[1].text, el[0].link));
}

// Recherche générale par mot-clé
async function search(query) {
  const url = `https://tononkira.serasera.org/tononkira?q=${encodeURIComponent(query)}`;

  try {
    const page = await axios.get(url);
    return await scrapList(page.data);
  } catch (err) {
    console.error('Erreur lors de la recherche:', err);
    return [];
  }
}

// Recherche par titre, artiste, ou paroles
async function searchBy(title = '', artist = '', lyrics = '') {
  const url = `https://tononkira.serasera.org/tononkira?lohateny=${encodeURIComponent(title)}&anarana=${encodeURIComponent(artist)}&hira=${encodeURIComponent(lyrics)}&submit=Tadiavo`;

  try {
    const page = await axios.get(url);
    return await scrapList(page.data);
  } catch (err) {
    console.error('Erreur lors de la recherche par critères:', err);
    return [];
  }
}

// Recherche par titre
async function searchByTitle(title) {
  return await searchBy(title);
}

// Recherche par artiste
async function searchByArtist(artist) {
  return await searchBy('', artist);
}

// Recherche par paroles
async function searchByLyrics(lyrics) {
  return await searchBy('', '', lyrics);
}

// Récupérer les paroles complètes à partir d'un lien
async function getLyricsByUrl(url) {
  try {
    const page = await axios.get(url);
    const $ = cheerio.load(page.data);
    $('.col.l-2-3.s-1-1 div').remove();
    return $('.col.l-2-3.s-1-1').text().trim();
  } catch (err) {
    console.error('Erreur lors de la récupération des paroles:', err);
    return 'Impossible de récupérer les paroles.';
  }
}

// Export des fonctions pour utilisation dans d'autres fichiers
module.exports = {
  search,
  searchByTitle,
  searchByArtist,
  searchByLyrics,
  getLyricsByUrl,
  IMusic,
};
