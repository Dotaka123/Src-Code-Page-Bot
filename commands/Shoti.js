const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'shoti',
  description: 'Send a random video',
  author: 'tata',
  usage:'shoti',


  async execute(senderId, args) {
    const pageAccessToken = token;

    try {
      const response = await axios.get('https://ccprojectapis.ddns.net/api/shoti-v2');
      const data = response.data;

      if (data.status) {
        const videoUrl = data.videoDownloadLink;

        // Send the video
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: videoUrl,
              is_reusable: true,
            },
          },
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Error: Could not fetch video.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error occurred while fetching the video.' }, pageAccessToken);
    }
  }
};
