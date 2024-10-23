const axios = require('axios');

module.exports = {
  name: 'Quote',
  description: 'Fetch random anime quotes',
  author: 'Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    try {
      sendMessage(senderId, { text: 'Recherche de superbe phrase pour toi...' }, pageAccessToken);
      const apiUrl = `https://animechan.io/api/v1/quotes/random`;
      const response = await axios.get(apiUrl);
      const quoteData = response.data.data;

      if (quoteData) {
        const quoteMessage = `Anime: ${quoteData.anime.name}\nCharacter: ${quoteData.character.name}\nQuote: ${quoteData.content}`;
        sendMessage(senderId, { text: quoteMessage }, pageAccessToken);
      } else {
        console.error('Error: No quote found in the response.');
        sendMessage(senderId, { text: 'Sorry, no quote was found.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
```

This code fetches a random quote from the Animechan API and sends a message containing the anime name, character name, and the quote content to the user.
・──── >ᴗ< ─────・
