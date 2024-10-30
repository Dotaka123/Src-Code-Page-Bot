const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'video',
  description: 'Search for YouTube videos based on user input',
  author: 'Coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(' '); // Get user input as search query

    if (!query) {
      await sendMessage(senderId, { text: 'Please provide a search query.' }, pageAccessToken);
      return;
    }

    try {
      // Search for videos using the provided API
      const response = await axios.get(`https://me0xn4hy3i.execute-api.us-east-1.amazonaws.com/staging/api/resolve/resolveYoutubeSearch?search=${encodeURIComponent(query)}`);
      const data = response.data;

      if (data.code === 200 && data.data.length > 0) {
        // Prepare buttons for each video result
        const quickReplies = {
          text: 'Here are some videos I found:',
          quick_replies: data.data.map(video => ({
            content_type: 'text',
            title: `Watch: ${video.title}`,
            payload: JSON.stringify({ videoId: video.videoId }), // Use JSON.stringify to encapsulate videoId
          })),
        };

        await sendMessage(senderId, quickReplies, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'No videos found for your search.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error occurred while searching for videos.' }, pageAccessToken);
    }
  },

  async handleButtonClick(senderId, payload) {
    console.log("Button click payload received:", payload); // Log the payload

    try {
      const { videoId } = JSON.parse(payload); // Parse the payload to extract videoId
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Send the video URL directly
      await sendMessage(senderId, {
        text: `Here is the video you requested: ${videoUrl}`, // Use text instead of attachment
      }, token);
    } catch (error) {
      console.error('Error handling button click:', error);
      await sendMessage(senderId, { text: 'Error: Unable to retrieve the video.' }, token);
    }
  }
};
