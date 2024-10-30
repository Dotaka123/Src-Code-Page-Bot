const axios = require('axios');
const tinyurl = require('tinyurl');
const fs = require('fs');

const fontMap = {
  ' ': ' ',
  'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡',
  'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪',
  'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
  'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇',
  'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐',
  'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
  '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
};

const globalApi = {
  base: "https://www.samirxpikachu.run.place",
  fallbacks: [
    "http://samirxpikachuio.onrender.com",
    "http://samirxzy.onrender.com"
  ]
};

const normalizeText = text => {
  const boldPattern = /\*\*(.*?)\*\*/g;
  return text.replace(boldPattern, (_, match) => applyFontMap(match));
};

const applyFontMap = str =>
  str.split('').map(char => fontMap[char] || char).join('');

const formatResponse = content => {
  const header = `🧋✨ |Ai 𝙰𝚒\n━━━━━━━━━━━━━━━\n`;
  const footer = `━━━━━━━━━━━━━━`;
  return `${header}${content.trim()}\n${footer}`;
};

async function fetchFromAPI(url) {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error("Primary API failed:", error.message);
    for (const fallback of globalApi.fallbacks) {
      try {
        return await axios.get(url.replace(globalApi.base, fallback));
      } catch (error) {
        console.error("Fallback API failed:", error.message);
      }
    }
    throw new Error("All APIs failed.");
  }
}

module.exports = {
  config: {
    name: "ai",
    version: "1.0",
    author: "Samir OE",
    usage:'ai [ta question]',
    countDown: 5,
    role: 0,
    category: "ai"
  },

  async onStart({ message, event, args, commandName }) {
    try {
      const senderId = event.senderID;
      const urlAttachment = event.messageReply?.attachments?.[0]?.url;
      const searchText = args.join(" ") + ", short direct answer";
      const urlParam = urlAttachment && ["photo", "sticker"].includes(event.messageReply.attachments[0].type)
        ? `&url=${encodeURIComponent(await tinyurl.shorten(urlAttachment))}`
        : '';

      const apiURL = `${globalApi.base}/gemini?text=${encodeURIComponent(searchText)}&system=default${urlParam}&uid=${senderId}`;
      const response = await fetchFromAPI(apiURL);
      const candidateText = response.data?.candidates?.[0]?.content?.parts[0]?.text;

      if (candidateText) {
        const formattedMessage = formatResponse(normalizeText(candidateText));
        message.reply({ body: formattedMessage }, (err, res) => {
          if (res) {
            global.GoatBot.onReply.set(res.messageID, {
              commandName,
              messageID: res.messageID,
              author: senderId
            });
          }
        });
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  },

  async onReply({ message, event, Reply, args }) {
    if (event.senderID !== Reply.author) return;

    try {
      const query = args.join(" ") + ", short direct answer";
      const apiURL = `${globalApi.base}/gemini?text=${encodeURIComponent(query)}&system=default&uid=${event.senderID}`;
      const response = await fetchFromAPI(apiURL);
      const candidateText = response.data?.candidates?.[0]?.content?.parts[0]?.text;

      if (candidateText) {
        const formattedMessage = formatResponse(normalizeText(candidateText));
        message.reply({ body: formattedMessage }, (err, res) => {
          if (res) {
            global.GoatBot.onReply.set(res.messageID, {
              commandName: Reply.commandName,
              messageID: res.messageID,
              author: event.senderID
            });
          }
        });
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  },

  async onChat({ message, event, args }) {
    const senderId = event.senderID;
    const text = args.join(" ").trim();
    const aiPattern = /^(-?[aA][iI])\s*/;

    try {
      const isAICommand = aiPattern.test(text);
      const query = isAICommand ? text.replace(aiPattern, '').trim() || 'hello' : null;

      if (query) {
        const apiURL = `${globalApi.base}/gemini?text=${encodeURIComponent(query)}&system=default&uid=${senderId}`;
        const response = await fetchFromAPI(apiURL);
        const candidateText = response.data?.candidates?.[0]?.content?.parts[0]?.text;

        if (candidateText) {
          const formattedMessage = formatResponse(normalizeText(candidateText));
          message.reply({ body: formattedMessage }, (err, res) => {
            if (res) {
              global.GoatBot.onReply.set(res.messageID, {
                commandName: '.',
                messageID: res.messageID,
                author: senderId
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
};
