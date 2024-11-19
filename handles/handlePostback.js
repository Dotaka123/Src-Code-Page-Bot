const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const { setUserMode } = require('../commands/gpt4');

// Map pour mémoriser le choix de l'utilisateur
const userDefaults = new Map();

// Fonction pour récupérer les chapitres d'un manga
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

    return chapter.data.map((fileName) => `${baseUrl}/${chapter.hash}/${fileName}`);
  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error.message);
    throw new Error('Impossible de récupérer les images du chapitre.');
  }
};

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    return console.error('Invalid postback event object');
  }

  try {
    if (payload === 'WELCOME_MESSAGE') {
      const welcomeMessage = '🇫🇷 Bienvenue dans l\'univers de Girlfriend AI 🌟!\nChoisissez votre mode de conversation pour commencer :';

      const buttons = [
        {
          type: 'postback',
          title: 'Mode fille 💖',
          payload: 'MODE_FILLE',
        },
        {
          type: 'postback',
          title: 'Mode garçon 💙',
          payload: 'MODE_GARCON',
        },
      ];

      await sendMessage(senderId, { text: welcomeMessage, buttons }, pageAccessToken);
    } else if (payload === 'MODE_FILLE') {
      setUserMode(senderId, 'fille');
      await sendMessage(senderId, { text: 'Mode fille activé ! 💕 Parlez avec Miora !' }, pageAccessToken);
    } else if (payload === 'MODE_GARCON') {
      setUserMode(senderId, 'garcon');
      await sendMessage(senderId, { text: 'Mode garçon activé ! 💙 Parlez avec Nario !' }, pageAccessToken);
    } else if (payload.startsWith('MANGA_SELECT_')) {
      const mangaId = payload.split('_')[2];

      try {
        const chapters = await getMangaChapters(mangaId);

        if (chapters.length === 0) {
          await sendMessage(senderId, { text: 'Aucun chapitre disponible pour ce manga.' }, pageAccessToken);
        } else {
          const buttons = chapters.map((chapter) => ({
            type: 'postback',
            title: chapter.title,
            payload: `CHAPTER_SELECT_${chapter.id}`,
          }));

          await sendMessage(senderId, { text: 'Sélectionnez un chapitre pour commencer la lecture :', buttons }, pageAccessToken);
        }
      } catch (error) {
        console.error('Erreur lors de la sélection du manga:', error.message);
        await sendMessage(senderId, { text: 'Une erreur est survenue lors de la récupération des chapitres.' }, pageAccessToken);
      }
    } else if (payload.startsWith('CHAPTER_SELECT_')) {
      const chapterId = payload.split('_')[2];

      try {
        const images = await getMangaChapterImages(chapterId);

        if (images.length === 0) {
          await sendMessage(senderId, { text: 'Aucune image trouvée pour ce chapitre.' }, pageAccessToken);
        } else {
          for (const image of images) {
            await sendMessage(senderId, {
              attachment: { type: 'image', payload: { url: image } },
            }, pageAccessToken);
          }

          await sendMessage(senderId, { text: 'Chapitre envoyé avec succès !' }, pageAccessToken);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi des images du chapitre:', error.message);
        await sendMessage(senderId, { text: 'Une erreur est survenue lors de l\'envoi des images.' }, pageAccessToken);
      }
    } else {
      await sendMessage(senderId, { text: `Postback inconnu : ${payload}` }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error handling postback:', error.message);
    await sendMessage(senderId, { text: 'Une erreur est survenue. Veuillez réessayer.' }, pageAccessToken);
  }
};

module.exports = { handlePostback, userDefaults };
