const axios = require('axios');

module.exports = {
  name: 'manga',
  description: 'Rechercher un manga et lire des chapitres',
  usage: 'manga <titre>',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const searchQuery = args.join(' ').trim();

    if (!searchQuery) {
      return await sendMessage(
        senderId,
        { text: 'Veuillez fournir un titre de manga à rechercher.' },
        pageAccessToken
      );
    }

    const searchUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(searchQuery)}&limit=5`;

    try {
      const response = await axios.get(searchUrl);
      const mangas = response.data.data;

      if (!mangas || mangas.length === 0) {
        return await sendMessage(
          senderId,
          { text: 'Aucun manga trouvé pour cette recherche.' },
          pageAccessToken
        );
      }

      // Créer des boutons pour les mangas trouvés
      const buttons = mangas.map(manga => ({
        type: 'postback',
        title: manga.attributes.title.en || 'Sans titre',
        payload: `MANGA_SELECT_${manga.id}`
      }));

      await sendMessage(
        senderId,
        {
          text: 'Mangas trouvés : sélectionnez un manga pour voir ses chapitres.',
          buttons
        },
        pageAccessToken
      );
    } catch (error) {
      console.error('Erreur lors de la recherche de manga:', error.message);
      await sendMessage(
        senderId,
        { text: 'Erreur lors de la recherche de manga. Veuillez réessayer.' },
        pageAccessToken
      );
    }
  }
};
