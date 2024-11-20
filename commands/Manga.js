const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const token = fs.readFileSync('token.txt', 'utf8');
let cachedChapters = []; // Cache des chapitres disponibles pour une recherche récente

// Fonction pour récupérer les chapitres d'un manga
const getMangaChapters = async (mangaId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
      params: { limit: 10, translatedLanguage: ['en'] },
    });
    const chapters = response.data.data.map((chapter) => ({
      id: chapter.id,
      title: chapter.attributes.title || 'Sans titre',
      chapterNumber: chapter.attributes.chapter || 'Inconnu',
    }));
    cachedChapters = chapters; // Mise en cache
    return chapters;
  } catch (error) {
    console.error('Erreur lors de la récupération des chapitres:', error.message);
    throw new Error('Impossible de récupérer les chapitres.');
  }
};

// Fonction pour récupérer les URLs des images d'un chapitre
const getMangaChapterImages = async (chapterId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = response.data;

    return chapter.data.map((fileName) => `${baseUrl}/data/${chapter.hash}/${fileName}`);
  } catch (error) {
    console.error('Erreur lors de la récupération des images du chapitre:', error.message);
    throw new Error('Impossible de récupérer les images du chapitre.');
  }
};

module.exports = {
  name: 'manga',
  description: 'Lire un manga ou un chapitre spécifique',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (args.length === 0) {
      await sendMessage(
        senderId,
        { text: 'Utilisation : `!manga <mangaId>` pour rechercher un manga ou `!manga lire <numéro>` pour lire un chapitre.' },
        pageAccessToken
      );
      return;
    }

    const command = args[0].toLowerCase();

    if (command === 'lire') {
      const chapterIndex = parseInt(args[1], 10) - 1;

      if (isNaN(chapterIndex) || chapterIndex < 0 || chapterIndex >= cachedChapters.length) {
        await sendMessage(
          senderId,
          { text: 'Veuillez entrer un numéro de chapitre valide parmi les chapitres listés.' },
          pageAccessToken
        );
        return;
      }

      const chapterId = cachedChapters[chapterIndex].id;

      try {
        const imageUrls = await getMangaChapterImages(chapterId);

        for (const url of imageUrls) {
          try {
            console.log(`Envoi de l'image : ${url}`);
            await sendMessage(
              senderId,
              {
                attachment: {
                  type: 'image',
                  payload: { url },
                },
              },
              pageAccessToken
            );
          } catch (error) {
            console.error(`Erreur lors de l'envoi de l'image (${url}):`, error.message);
          }
        }

        await sendMessage(
          senderId,
          { text: 'Chapitre envoyé avec succès !' },
          pageAccessToken
        );
      } catch (error) {
        console.error('Erreur dans la commande manga lire:', error.message);
        await sendMessage(
          senderId,
          { text: 'Une erreur est survenue lors de la récupération du chapitre.' },
          pageAccessToken
        );
      }
    } else {
      // Rechercher un manga et lister les chapitres
      const mangaId = args[0];

      try {
        const chapters = await getMangaChapters(mangaId);

        const chapterList = chapters
          .map((ch, index) => `${index + 1}. Chapitre ${ch.chapterNumber} - ${ch.title}`)
          .join('\n');

        await sendMessage(
          senderId,
          { text: `Voici les chapitres disponibles :\n\n${chapterList}\n\nEnvoyez \`!manga lire <numéro>\` pour lire un chapitre.` },
          pageAccessToken
        );
      } catch (error) {
        console.error('Erreur dans la commande manga:', error.message);
        await sendMessage(
          senderId,
          { text: 'Impossible de récupérer les chapitres pour ce manga.' },
          pageAccessToken
        );
      }
    }
  },
};
