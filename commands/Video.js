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
        const buttons = data.data.map(video => ({
          title: `Watch: ${video.title}`,
          videoId: video.videoId, // Store the videoId for sending the video directly
        }));

        const quickReplies = {
          text: 'Here are some videos I found:',
          quick_replies: buttons.map(button => ({
            content_type: 'text',
            title: button.title,
            payload: button.videoId, // Use videoId as the payload
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

  async handleButtonClick(senderId, videoId) {
    // Handle the button click to send the actual video
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Here, we'll need to send the video URL directly
    await sendMessage(senderId, {
      attachment: {
        type: 'video',
        payload: {
          url: videoUrl, // Send the video URL directly
          is_reusable: true,
        },
      },
    }, token);
  }
};
