const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'manga',
  description: 'Rechercher et lire des mangas depuis MangaDex',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Veuillez utiliser les commandes suivantes :\n\n- `!manga <titre>` : Rechercher un manga\n- `!manga lire <numéro>` : Lire un chapitre spécifique\n\nExemple : `!manga One Piece`',
      }, pageAccessToken);
      return;
    }

    const command = args[0].toLowerCase();
    if (command === 'lire' && args.length > 2) {
      const chapterNumber = args[1];
      const mangaId = args[2]; // ID du manga passé comme argument
      await this.readChapter(senderId, chapterNumber, mangaId, pageAccessToken);
      return;
    }

    const query = args.join(' ').trim();
    if (!query) {
      await sendMessage(senderId, { text: 'Veuillez entrer le nom d\'un manga pour le rechercher.' }, pageAccessToken);
      return;
    }

    try {
      // Rechercher le manga
      const searchResponse = await axios.get('https://api.mangadex.org/manga', {
        params: {
          title: query,
          limit: 1,
        },
      });

      if (searchResponse.data.data.length === 0) {
        await sendMessage(senderId, { text: `Aucun manga trouvé pour "${query}".` }, pageAccessToken);
        return;
      }

      const manga = searchResponse.data.data[0];
      const mangaTitle = manga.attributes.title.en || manga.attributes.title.jp;
      const mangaId = manga.id;

      // Obtenir les chapitres
      const chaptersResponse = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
        params: {
          translatedLanguage: ['en'],
          order: { chapter: 'asc' },
          limit: 5,
        },
      });

      const chapters = chaptersResponse.data.data;
      if (chapters.length === 0) {
        await sendMessage(senderId, { text: `Aucun chapitre disponible pour "${mangaTitle}".` }, pageAccessToken);
        return;
      }

      // Construire la liste des chapitres
      let chapterList = `📖 Voici les chapitres disponibles pour ${mangaTitle} :\n\n`;
      chapters.forEach((chapter, index) => {
        const chapterNumber = chapter.attributes.chapter || 'N/A';
        chapterList += `${index + 1}. Chapitre ${chapterNumber} (ID: ${mangaId})\n`;
      });
      chapterList += '\nPour lire un chapitre, utilisez la commande : `!manga lire <numéro> <ID>`';

      await sendMessage(senderId, { text: chapterList }, pageAccessToken);
    } catch (error) {
      console.error('Erreur lors de la recherche de manga:', error.message);
      await sendMessage(senderId, { text: 'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.' }, pageAccessToken);
    }
  },

  async readChapter(senderId, chapterNumber, mangaId, pageAccessToken) {
    try {
      const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
        params: {
          translatedLanguage: ['en'],
          order: { chapter: 'asc' },
          limit: 100,
        },
      });

      const chapters = response.data.data;
      const chapter = chapters.find(ch => ch.attributes.chapter === chapterNumber);

      if (!chapter) {
        await sendMessage(senderId, { text: `Chapitre ${chapterNumber} introuvable pour ce manga.` }, pageAccessToken);
        return;
      }

      const pages = chapter.attributes.data;
      const baseUrl = `https://uploads.mangadex.org/data/${chapter.attributes.hash}/`;

      await sendMessage(senderId, {
        text: `📖 Voici la première page du chapitre ${chapterNumber} : ${baseUrl}${pages[0]}`,
      }, pageAccessToken);
    } catch (error) {
      console.error('Erreur lors de la lecture du chapitre:', error.message);
      await sendMessage(senderId, { text: 'Impossible de lire ce chapitre. Vérifiez le numéro et réessayez.' }, pageAccessToken);
    }
  },
};
