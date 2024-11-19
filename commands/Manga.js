const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const token = fs.readFileSync('token.txt', 'utf8');

// Fonction pour récupérer les URLs des images d'un chapitre depuis MangaDex
const getMangaChapterImages = async (chapterId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = response.data;

    const imageUrls = chapter.data.map((fileName) => `${baseUrl}/data/${chapter.hash}/${fileName}`);
    return imageUrls;
  } catch (error) {
    console.error('Erreur lors de la récupération des images du chapitre:', error.message);
    throw new Error('Impossible de récupérer les images du chapitre.');
  }
};

module.exports = {
  name: 'manga',
  description: 'Lire un chapitre de manga spécifique sans serveur externe',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (args.length === 0) {
      await sendMessage(
        senderId,
        { text: 'Utilisation : `!manga lire <chapterId>` pour lire un chapitre.' },
        pageAccessToken
      );
      return;
    }

    const command = args[0].toLowerCase();
    const chapterId = args[1];

    if (command === 'lire' && chapterId) {
      try {
        // Récupération des URLs des images du chapitre
        const imageUrls = await getMangaChapterImages(chapterId);

        for (const url of imageUrls) {
          try {
            console.log(`Envoi de l'image : ${url}`);
            // Envoi direct des images via Messenger
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

        // Message de confirmation une fois que toutes les images sont envoyées
        await sendMessage(
          senderId,
          { text: 'Chapitre envoyé avec succès !' },
          pageAccessToken
        );
      } catch (error) {
        console.error('Erreur dans la commande manga:', error.message);
        await sendMessage(
          senderId,
          { text: 'Une erreur est survenue lors de la récupération du chapitre.' },
          pageAccessToken
        );
      }
    } else {
      await sendMessage(
        senderId,
        { text: 'Commande invalide. Utilisez `!manga lire <chapterId>`.' },
        pageAccessToken
      );
    }
  },
};
