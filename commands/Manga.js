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
        text: 'Veuillez utiliser les commandes suivantes :\n\n- `!manga <titre>` : Rechercher un manga\n- `!manga lire <chapterId>` : Lire un chapitre spécifique\n\nExemple : `!manga One Piece`',
      }, pageAccessToken);
      return;
    }

    const command = args[0].toLowerCase();
    if (command === 'lire' && args.length > 1) {
      const chapterId = args[1];
      await this.readChapter(senderId, chapterId, pageAccessToken);
      return;
    }

    const query = args.join(' ').trim();
    if (!query) {
      await sendMessage(senderId, { text: 'Veuillez entrer le nom d\'un manga pour le rechercher.' }, pageAccessToken);
      return;
    }

    try {
      // Étape 1 : Rechercher le manga
      const searchResponse = await axios.get('https://api.mangadex.org/manga', {
        params: { title: query, limit: 1 },
      });

      if (searchResponse.data.data.length === 0) {
        await sendMessage(senderId, { text: `Aucun manga trouvé pour "${query}".` }, pageAccessToken);
        return;
      }

      const manga = searchResponse.data.data[0];
      const mangaTitle = manga.attributes.title.en || manga.attributes.title.jp;
      const mangaId = manga.id;

      // Étape 2 : Obtenir les chapitres
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
        const chapterId = chapter.id;
        chapterList += `${index + 1}. Chapitre ${chapterNumber} (ID: ${chapterId})\n`;
      });
      chapterList += '\nPour lire un chapitre, utilisez la commande : `!manga lire <chapterId>`';

      await sendMessage(senderId, { text: chapterList }, pageAccessToken);
    } catch (error) {
      console.error('Erreur lors de la recherche de manga:', error.message);
      await sendMessage(senderId, { text: 'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.' }, pageAccessToken);
    }
  },

  async readChapter(senderId, chapterId, pageAccessToken) {
    try {
      // Étape 1 : Obtenir les données du chapitre
      const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);

      if (response.data.result !== 'ok') {
        await sendMessage(senderId, { text: 'Impossible de récupérer les pages de ce chapitre.' }, pageAccessToken);
        return;
      }

      const { baseUrl, chapter } = response.data;
      const pages = chapter.data;

      // Étape 2 : Télécharger et envoyer toutes les pages
      for (let i = 0; i < pages.length; i++) {
        const pageUrl = `${baseUrl}/data/${chapter.hash}/${pages[i]}`;
        try {
          // Téléchargement de l'image
          const imageResponse = await axios.get(pageUrl, { responseType: 'arraybuffer' });
          
          // Envoi de l'image via l'API Messenger
          const imageBuffer = Buffer.from(imageResponse.data, 'binary');
          const imageAttachment = {
            type: 'image',
            payload: {
              url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
              is_reusable: true,
            },
          };

          await sendMessage(senderId, { attachment: imageAttachment }, pageAccessToken);
        } catch (error) {
          console.error('Erreur lors de l\'envoi de l\'image:', error.message);
          await sendMessage(senderId, { text: 'Erreur lors du chargement d\'une page. Veuillez réessayer plus tard.' }, pageAccessToken);
        }
      }

    } catch (error) {
      console.error('Erreur lors de la lecture du chapitre:', error.message);
      await sendMessage(senderId, { text: 'Impossible de lire ce chapitre. Vérifiez l\'ID et réessayez.' }, pageAccessToken);
    }
  },
};
