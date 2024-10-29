const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Reading the access token for sending messages
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'video',
  description: 'Search for YouTube videos and provide an option to download audio',
  author: 'Kenneth Panio',
  
  async execute(senderId, args) {
    const pageAccessToken = token;
    const searchQuery = args.join(' ').trim();

    // Check if a search term is provided
    if (!searchQuery) {
      return await sendMessage(senderId, { text: 'Please provide a search term for YouTube.' }, pageAccessToken);
    }

    try {
      // Search for YouTube videos using the search API
      const searchUrl = `https://me0xn4hy3i.execute-api.us-east-1.amazonaws.com/staging/api/resolve/resolveYoutubeSearch?search=${encodeURIComponent(searchQuery)}`;
      const searchResponse = await axios.get(searchUrl);
      const searchData = searchResponse.data;

      // Check if there are results
      if (searchData.code !== 200 || !searchData.data.length) {
        return await sendMessage(senderId, { text: 'No results found for your search.' }, pageAccessToken);
      }

      // Use the first video result for simplicity
      const video = searchData.data[0];
      const downloadUrl = `https://api-improve-production.up.railway.app/yt/download?url=${encodeURIComponent(video.url)}&format=mp3&quality=180`;

      // Fetch audio download URL from the download API
      const downloadResponse = await axios.get(downloadUrl);
      const audioData = downloadResponse.data;

      // Check if audio was downloaded successfully
      if (audioData.message !== 'Audio downloaded successfully.') {
        return await sendMessage(senderId, { text: 'Error: Unable to download audio for the selected video.' }, pageAccessToken);
      }

      // Send the video info with a download button
      const message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: audioData.info.title,
              image_url: audioData.info.thumbnail,
              subtitle: `Artist: ${audioData.info.artist}\nAlbum: ${audioData.info.album}`,
              buttons: [{
                type: 'web_url',
                url: audioData.audio,
                title: 'Download Audio',
                webview_height_ratio: 'tall'
              }]
            }]
          }
        }
      };

      // Send the formatted message with download link
      await sendMessage(senderId, message, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error while processing your request.' }, pageAccessToken);
    }
  }
};
