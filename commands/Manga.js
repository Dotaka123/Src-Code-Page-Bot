const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const IMGBB_API_KEY = 'b93e7b100ae4f09207aeab488ce7074a'; // Remplacez par votre clé API ImgBB
const token = fs.readFileSync('token.txt', 'utf8');

// Fonction pour télécharger une image sur ImgBB
const uploadToImgBB = async (base64Image) => {
  try {
    const formData = new FormData();
    formData.append('image', base64Image);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData, {
      headers: formData.getHeaders(),
    });

    return response.data.data.url; // Retourne l'URL hébergée
  } catch (error) {
    console.error('Erreur ImgBB:', error.message);
    throw new Error('Échec de l\'hébergement de l\'image sur ImgBB.');
  }
};

// Fonction pour récupérer les images d’un chapitre MangaDex
const getMangaChapterImages = async (chapterId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = response.data;

    const imageUrls = chapter.data.map((fileName) => `${baseUrl}/data/${chapter.hash}/${fileName}`);
    return imageUrls;
  } catch (error) {
    console.error('Erreur récupération des images:', error.message);
    throw new Error('Impossible de récupérer les images du chapitre.');
  }
};

// Fonction pour rechercher un manga par titre
const searchManga = async (query) => {
  try {
    const response = await axios.get('https://api.mangadex.org/manga', {
      params: {
        title: query,
        limit: 5,
      },
    });

    const results = response.data.data.map((manga) => ({
      id: manga.id,
      title: manga.attributes.title.en || manga.attributes.title.jp || 'Titre inconnu',
    }));

    return results;
  } catch (error) {
    console.error('Erreur recherche de manga:', error.message);
    throw new Error('Impossible de rechercher ce manga.');
  }
};

// Fonction pour récupérer les chapitres d'un manga
const getMangaChapters = async (mangaId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
      params: {
        translatedLanguage: ['en'], // Récupérer uniquement les chapitres traduits en anglais
        limit: 5,
      },
    });

    const chapters = response.data.data.map((chapter) => ({
      id: chapter.id,
      title: chapter.attributes.title || `Chapitre ${chapter.attributes.chapter}`,
    }));

    return chapters;
  } catch (error) {
    console.error('Erreur récupération des chapitres:', error.message);
    throw new Error('Impossible de récupérer les chapitres du manga.');
  }
};

// Commande principale
module.exports = {
  name: 'manga',
  description: 'Rechercher et lire des mangas',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (args.length === 0) {
      await sendMessage(
        senderId,
        { text: 'Utilisation :\n1. `!manga rechercher <titre>` pour chercher un manga.\n2. `!manga lire <chapterId>` pour lire un chapitre.' },
        pageAccessToken
      );
      return;
    }

    const command = args[0].toLowerCase();
    const query = args.slice(1).join(' ');

    try {
      if (command === 'rechercher' && query) {
        // Recherche de manga par titre
        const mangas = await searchManga(query);

        if (mangas.length === 0) {
          await sendMessage(senderId, { text: 'Aucun manga trouvé pour cette recherche.' }, pageAccessToken);
          return;
        }

        // Envoyer la liste des mangas trouvés
        for (const manga of mangas) {
          const chapters = await getMangaChapters(manga.id);
          const chapterList = chapters
            .map((ch) => `${ch.title} (ID: ${ch.id})`)
            .join('\n') || 'Aucun chapitre disponible.';

          await sendMessage(
            senderId,
            {
              text: `📖 **${manga.title}**\nChapitres disponibles :\n${chapterList}\n\nUtilisez \`!manga lire <chapterId>\` pour lire un chapitre.`,
            },
            pageAccessToken
          );
        }
      } else if (command === 'lire' && query) {
        // Lecture d'un chapitre
        const chapterId = query;

        // Récupération des images du chapitre
        const imageUrls = await getMangaChapterImages(chapterId);

        for (const url of imageUrls) {
          try {
            // Télécharger et convertir en base64
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const base64Image = Buffer.from(response.data).toString('base64');

            // Télécharger sur ImgBB
            const imgBBUrl = await uploadToImgBB(base64Image);

            // Envoyer l'image hébergée
            await sendMessage(
              senderId,
              { attachment: { type: 'image', payload: { url: imgBBUrl } } },
              pageAccessToken
            );
          } catch (error) {
            console.error(`Erreur envoi image pour URL ${url}:`, error.message);
          }
        }

        await sendMessage(senderId, { text: '✅ Toutes les pages du chapitre ont été envoyées avec succès !' }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Commande invalide. Utilisez `!manga rechercher <titre>` ou `!manga lire <chapterId>`.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Erreur dans la commande manga:', error.message);
      await sendMessage(senderId, { text: 'Une erreur est survenue. Veuillez réessayer plus tard.' }, pageAccessToken);
    }
  },
};
