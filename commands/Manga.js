const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const token = fs.readFileSync('token.txt', 'utf8');

// Fonction pour rechercher des mangas par titre
const searchMangaByTitle = async (title) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/manga`, {
      params: {
        title,
        limit: 5,
        includes: ['chapter'],
        order: { relevance: 'desc' },
      },
    });

    return response.data.data.map((manga) => ({
      id: manga.id,
      title: manga.attributes.title.en || manga.attributes.title.ja || 'Titre inconnu',
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche de mangas:', error.message);
    throw new Error('Impossible de rechercher des mangas.');
  }
};

// Fonction pour récupérer les chapitres traduits en anglais
const getMangaChapters = async (mangaId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/chapter`, {
      params: {
        manga: mangaId,
        translatedLanguage: ['en'],
        order: { chapter: 'asc' },
        limit: 5,
      },
    });

    return response.data.data.map((chapter) => ({
      id: chapter.id,
      title: chapter.attributes.title || `Chapitre ${chapter.attributes.chapter}`,
    }));
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
  description: 'Recherche et lecture de manga simplifiée',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (args.length === 0) {
      await sendMessage(
        senderId,
        { text: 'Utilisation : `!manga <titre>` pour rechercher un manga.' },
        pageAccessToken
      );
      return;
    }

    const query = args.join(' ');

    try {
      // Étape 1 : Recherche des mangas
      const mangas = await searchMangaByTitle(query);

      if (mangas.length === 0) {
        await sendMessage(
          senderId,
          { text: `Aucun manga trouvé pour "${query}". Essayez un autre titre.` },
          pageAccessToken
        );
        return;
      }

      // Affichage des résultats de la recherche
      const mangaChoices = mangas.map((manga, index) => ({
        content_type: 'text',
        title: manga.title,
        payload: `MANGA_SELECT_${manga.id}`,
      }));

      await sendMessage(
        senderId,
        {
          text: `Résultats pour "${query}" :`,
          quickReplies: mangaChoices,
        },
        pageAccessToken
      );
    } catch (error) {
      console.error('Erreur dans la commande manga:', error.message);
      await sendMessage(
        senderId,
        { text: 'Une erreur est survenue lors de la recherche du manga.' },
        pageAccessToken
      );
    }
  },

  async handlePostback(senderId, postbackPayload) {
    const pageAccessToken = token;

    if (postbackPayload.startsWith('MANGA_SELECT_')) {
      const mangaId = postbackPayload.replace('MANGA_SELECT_', '');

      try {
        // Étape 2 : Récupération des chapitres du manga sélectionné
        const chapters = await getMangaChapters(mangaId);

        if (chapters.length === 0) {
          await sendMessage(
            senderId,
            { text: 'Aucun chapitre disponible pour ce manga.' },
            pageAccessToken
          );
          return;
        }

        // Affichage des chapitres disponibles
        const chapterChoices = chapters.map((chapter, index) => ({
          content_type: 'text',
          title: chapter.title,
          payload: `CHAPTER_SELECT_${chapter.id}`,
        }));

        await sendMessage(
          senderId,
          {
            text: `Chapitres disponibles pour ce manga :`,
            quickReplies: chapterChoices,
          },
          pageAccessToken
        );
      } catch (error) {
        console.error('Erreur lors de la récupération des chapitres:', error.message);
        await sendMessage(
          senderId,
          { text: 'Une erreur est survenue lors de la récupération des chapitres.' },
          pageAccessToken
        );
      }
    } else if (postbackPayload.startsWith('CHAPTER_SELECT_')) {
      const chapterId = postbackPayload.replace('CHAPTER_SELECT_', '');

      try {
        // Étape 3 : Récupération des images du chapitre sélectionné
        const imageUrls = await getMangaChapterImages(chapterId);

        for (const url of imageUrls) {
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
        }

        await sendMessage(
          senderId,
          { text: 'Chapitre envoyé avec succès !' },
          pageAccessToken
        );
      } catch (error) {
        console.error('Erreur lors de l\'envoi des images du chapitre:', error.message);
        await sendMessage(
          senderId,
          { text: 'Une erreur est survenue lors de l\'envoi des images du chapitre.' },
          pageAccessToken
        );
      }
    }
  },
};
