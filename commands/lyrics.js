const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'lyrics',
  description: 'Fetch song lyrics',
  usage: 'lyrics [song name]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    if (!args.length) {
      await sendMessage(senderId, { text: 'Please provide the name of the song.' }, pageAccessToken);
      return;
    }

    const query = args.join(' ').trim();

    try {
      // Fetch lyrics data from the API
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/lyrics?song=${encodeURIComponent(query)}`);
      const result = response.data;

      // Check if lyrics were found
      if (result && result.lyrics) {
        const { title, artist, lyrics, image } = result;

        // Split the message into chunks and send each part
        const messages = splitMessage(title, artist, lyrics, 2000);
        for (const message of messages) {
          await sendMessage(senderId, { text: message }, pageAccessToken);
        }

        // Send the image if available
        if (image) {
          await sendMessage(senderId, {
            attachment: {
              type: 'image',
              payload: {
                url: image,
                is_reusable: true
              }
            }
          }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: 'Sorry, no lyrics were found for your query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error.message);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

// Utility function to split long messages into chunks
const splitMessage = (title, artist, lyrics, chunkSize) => {
  const message = `Title: ${title}\nArtist: ${artist}\n\n${lyrics}`;
  const chunks = [];
  
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }

  return chunks;
};
