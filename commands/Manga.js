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

    // Commande de base : Vérifier si un argument est fourni
    if (args.length === 0) {
      await sendMessage(senderId, { text: 'Veuillez utiliser les commandes suivantes :\n\n- `!manga <titre>` : Rechercher un manga\n- `!manga lire <chapitre>` : Lire un chapitre spécifique\n\nExemple : `!manga One Piece`' }, pageAccessToken);
      return;
    }

    // Déterminer si l'utilisateur veut lire un chapitre ou rechercher un manga
    const command = args[0].toLowerCase();
    if (command === 'lire' && args.length > 1) {
      const chapterNumber = args[1];
      await this.readChapter(senderId, chapterNumber, pageAccessToken);
      return;
    }

    // Si ce n'est pas "lire", effectuer une recherche
    const query = args.join(' ').trim();
    if (!query) {
      await sendMessage(senderId, { text: 'Veuillez entrer le nom d\'un manga pour le rechercher. Exemple : `!manga Naruto`' }, pageAccessToken);
      return;
    }

    try {
      // Étape 1 : Rechercher le manga
      const searchResponse = await axios.get(`https://api.mangadex.org/manga`, {
        params: {
          title: query,
          limit: 1
        }
      });

      if (searchResponse.data.data.length === 0) {
        await sendMessage(senderId, { text: `Aucun manga trouvé pour "${query}".` }, pageAccessToken);
        return;
      }

      const manga = searchResponse.data.data[0];
      const mangaTitle = manga.attributes.title.en || manga.attributes.title.jp;
      const mangaId = manga.id;

      // Étape 2 : Obtenir les chapitres du manga
      const chaptersResponse = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
        params: {
          translatedLanguage: ['en'],
          order: { chapter: 'asc' },
          limit: 5
        }
      });

      const chapters = chaptersResponse.data.data;
      if (chapters.length === 0) {
        await sendMessage(senderId, { text: `Aucun chapitre trouvé pour "${mangaTitle}".` }, pageAccessToken);
        return;
      }

      // Construire la liste des chapitres disponibles
      let chapterList = `📖 Voici les chapitres disponibles pour ${mangaTitle} :\n\n`;
      chapters.forEach((chapter, index) => {
        const chapterNumber = chapter.attributes.chapter || 'N/A';
        chapterList += `${index + 1}. Chapitre ${chapterNumber}\n`;
      });
      chapterList += '\nVeuillez entrer `!manga lire <numéro du chapitre>` pour lire un chapitre.';

      await sendMessage(senderId, { text: chapterList }, pageAccessToken);

    } catch (error) {
      console.error('Erreur lors de la recherche de manga:', error.message);
      await sendMessage(senderId, { text: 'Une erreur est survenue lors de la recherche du manga. Veuillez réessayer plus tard.' }, pageAccessToken);
    }
  },

  // Fonction pour lire un chapitre
  async readChapter(senderId, chapterNumber, pageAccessToken) {
    try {
      // Rechercher le chapitre spécifique
      const response = await axios.get(`https://api.mangadex.org/chapter`, {
        params: {
          chapter: chapterNumber,
          translatedLanguage: ['en']
        }
      });

      const chapters = response.data.data;
      if (chapters.length === 0) {
        await sendMessage(senderId, { text: `Chapitre ${chapterNumber} introuvable.` }, pageAccessToken);
        return;
      }

      const chapter = chapters[0];
      const pages = chapter.attributes.data;
      const baseUrl = `https://uploads.mangadex.org/data/${chapter.attributes.hash}/`;

      // Envoyer un message avec la première page
      await sendMessage(senderId, { text: `📖 Voici la première page du chapitre ${chapterNumber} : ${baseUrl}${pages[0]}` }, pageAccessToken);

    } catch (error) {
      console.error('Erreur lors de la lecture du chapitre:', error.message);
      await sendMessage(senderId, { text: 'Impossible de lire ce chapitre. Vérifiez le numéro et réessayez.' }, pageAccessToken);
    }
  }
};
