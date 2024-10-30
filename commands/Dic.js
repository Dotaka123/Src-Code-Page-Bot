const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
    name: 'dic',
    description: 'Dictionnaire',
    author: 'tata',
    usage:'dic [le mot]',

    async execute(senderId, args) {
        const pageAccessToken = token;
        const input = (args.join(' ') || 'hi').trim();

        try {
            sendMessage(senderId, { text: 'Recherche de resultat en cours...' }, pageAccessToken);
            // Make a request to the new API
            const response = await axios.get(`https://ccprojectapis.ddns.net/api/dictio?q=${encodeURIComponent(input)}`);
            const data = response.data;

            if (data.status) {
                // Format the message using the API response
                const word = data.word;
                const phonetic = data.phonetic;
                const meanings = data.meanings.map(meaning => {
                    const partOfSpeech = meaning.partofspeech;
                    const definitions = meaning.definitions.map(def => def.definition).join('; ');
                    return `${partOfSpeech}: ${definitions}`;
                }).join('\n');

                const formattedMessage = `Word: ${word}\nPhonetic: ${phonetic}\nMeanings:\n${meanings}`;
                await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
            } else {
                await sendMessage(senderId, { text: 'No definition found.' }, pageAccessToken);
            }
        } catch (error) {
            console.error('Error:', error);
            await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
        }
    }
};
