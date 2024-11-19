const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { sendMessage } = require('../handles/sendMessage');

const IMGBB_API_KEY = 'b93e7b100ae4f09207aeab488ce7074a'; // Obtenez une clé API gratuite sur https://api.imgbb.com/

const uploadToImgBB = async (base64Image) => {
  const formData = new FormData();
  formData.append('image', base64Image);

  const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData, {
    headers: formData.getHeaders(),
  });

  return response.data.data.url; // Retourne l'URL de l'image hébergée
};

const getMangaChapterImages = async (chapterId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = response.data;

    const imageUrls = chapter.data.map((fileName) => `${baseUrl}/${chapter.hash}/${fileName}`);
    return imageUrls;
  } catch (error) {
    console.error('Erreur lors de la récupération des images du chapitre:', error.message);
    throw new Error('Impossible de récupérer les images du chapitre.');
  }
};

module.exports = {
  name: 'manga',
  description: 'Lire un chapitre de manga spécifique',
  author: 'Tata',

  async execute(senderId, args, pageAccessToken) {
    const command = args[0];
    const chapterId = args[1];

    if (command === 'lire' && chapterId) {
      try {
        // Récupère les URLs des images du chapitre
        const imageUrls = await getMangaChapterImages(chapterId);

        // Boucle pour envoyer chaque image au bot
        for (const url of imageUrls) {
          await sendMessage(senderId, { attachment: { type: 'image', payload: { url } } }, pageAccessToken);
        }

        await sendMessage(senderId, { text: 'Chapitre envoyé avec succès !' }, pageAccessToken);
      } catch (error) {
        console.error('Erreur dans la commande manga:', error.message);
        await sendMessage(senderId, { text: 'Une erreur est survenue lors de la récupération du chapitre.' }, pageAccessToken);
      }
    } else {
      await sendMessage(senderId, { text: 'Commande invalide. Utilisez `!manga lire <chapterId>`.' }, pageAccessToken);
    }
  },
};
