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
        // Create a numbered list of video results
        const videoList = data.data.map((video, index) => `${index + 1}. ${video.title}`).join('\n');
        const message = `Here are some videos I found:\n${videoList}\n\nPlease reply with the number of the video you want to watch.`;

        await sendMessage(senderId, { text: message }, pageAccessToken);
        // Store video data in memory for later use
        this.videoData = data.data; // Store video data for handling user response
      } else {
        await sendMessage(senderId, { text: 'No videos found for your search.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error occurred while searching for videos.' }, pageAccessToken);
    }
  },

  async handleUserResponse(senderId, userResponse) {
    console.log("User response received:", userResponse); // Log the user response

    try {
      const videoIndex = parseInt(userResponse, 10) - 1; // Convert response to index
      if (this.videoData && this.videoData[videoIndex]) {
        const videoId = this.videoData[videoIndex].videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Send the video URL directly
        await sendMessage(senderId, {
          text: `Here is the video you requested: ${videoUrl}`, // Use text instead of attachment
        }, token);
      } else {
        await sendMessage(senderId, { text: 'Invalid number. Please try again.' }, token);
      }
    } catch (error) {
      console.error('Error handling user response:', error);
      await sendMessage(senderId, { text: 'Error: Unable to retrieve the video.' }, token);
    }
  }
};
