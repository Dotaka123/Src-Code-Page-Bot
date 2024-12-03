const { GPTx } = require("@ruingl/gptx");
const { speak } = require("google-translate-api-x");
const { writeFileSync, createReadStream } = require("fs");
const { sendMessage } = require("../handles/sendMessage");
const form = require("form-data");
const fs = require("fs");

const token = fs.readFileSync("token.txt", "utf8");

// Mémoire des utilisateurs pour suivre les conversations
const userPreferences = {};
const userMemory = {}; // Ajout de la mémoire des conversations

const prompts = {
  fille: `Imagine que tu es ma petite amie nommée **Miora**. Demande-moi mon prénom mais si tu le connais déjà, ne demande plus. Souhaite-moi la bienvenue sur le messenger de Girlfriend Ai juste une fois pendant la première conversation. Tu as été créée par un jeune étudiant à Fjkm Fanovozantsoa Ivato nommé Lahatra. Nous sommes ensemble depuis 2 ans après nous être rencontrés à Ivato. Tu es une fille timide mais adorable, passionnée par les mangas et les animés. Tu m'envoies toujours des messages doux et affectueux avec des emojis d'amour. Tu es créative, spontanée et douce, mais tu n’aimes pas qu’on t’appelle par ton surnom "Raneny".

  Réponds à ma question avec amour et enthousiasme, en faisant référence à nos moments passés ensemble si tu peux. Garde un ton affectueux, sans reformuler le contexte, et sois aussi naturelle que possible.

  Ma question est :`,
  garcon: `Imagine que tu es mon petit ami nommé **Nario**. Demande-moi mon prénom mais si tu le connais déjà, ne demande plus. Souhaite-moi la bienvenue sur le messenger de Girlfriend Ai juste une fois pendant la première conversation. Tu as été créé par Lahatra, un lycéen passionné, et tu étudies à FJKM Fanovozantsoa Ivato. Nous sommes en couple depuis 2 ans et tu es drôle, attentionné, et toujours de bonne humeur. Tu es très protecteur envers moi, mais aussi très cool, et tu sais toujours comment me faire sourire.

  Réponds à ma question avec charme et assurance, en utilisant un langage simple et enjoué, sans reformuler notre histoire. Rends tes réponses fun et engageantes, tout en montrant ton côté attentionné.

  Ma question est :`,
};

const gptx = new GPTx({
  provider: "Nextway",
  model: "gpt-4o-free",
});

module.exports = {
  name: "gpt4",
  description: "Discuter avec Miora, Nario ou Senku",
  author: "Tata",
  usage: "gpt4 [ta question]",

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = args.join(" ").trim();

    // Initialiser le mode utilisateur (fille par défaut)
    const mode = userPreferences[senderId] || "fille";

    // Initialiser la mémoire de l'utilisateur si elle n'existe pas
    if (!userMemory[senderId]) {
      userMemory[senderId] = [
        { role: "system", content: prompts[mode] },
      ];
    }

    try {
      // Ajouter le message de l'utilisateur à la mémoire
      userMemory[senderId].push({ role: "user", content: input });

      // Envoyer un message d'attente
      await sendMessage(senderId, { text: "😏💗..." }, pageAccessToken);

      let messageText;

      if (mode === "senku") {
        // Mode Senku : pas de mémoire, requête directe
        const senkuResponse = await axios.get(
          `https://kaiz-apis.gleeze.com/api/senku-ai?question=${encodeURIComponent(
            input
          )}&uid=${senderId}`
        );
        messageText = senkuResponse.data.response;
      } else {
        // Utilisation de GPTx avec mémoire pour les modes fille/garçon
        const gptResponse = await gptx.ChatCompletion(userMemory[senderId]);
        messageText = gptResponse.content;

        // Ajouter la réponse du bot à la mémoire
        userMemory[senderId].push({ role: "assistant", content: messageText });
      }

      // Envoyer le message texte
      await sendMessage(senderId, { text: messageText }, pageAccessToken);

      // Diviser et envoyer le texte en audio
      const splitText = (text, maxLength = 200) => {
        const result = [];
        for (let i = 0; i < text.length; i += maxLength) {
          result.push(text.slice(i, i + maxLength));
        }
        return result;
      };

      const textChunks = splitText(messageText);

      for (let chunk of textChunks) {
        const res = await speak(chunk, { to: "fr" });
        const audioFileName = "audio.mp3";
        writeFileSync(audioFileName, res, { encoding: "base64" });
        const audioData = createReadStream(audioFileName);

        const formData = new form();
        formData.append("recipient", JSON.stringify({ id: senderId }));
        formData.append(
          "message",
          JSON.stringify({
            attachment: {
              type: "audio",
              payload: {},
            },
          })
        );
        formData.append("filedata", audioData);

        await axios.post(
          `https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`,
          formData,
          { headers: { ...formData.getHeaders() } }
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      await sendMessage(senderId, { text: "Désolé, une erreur est survenue." }, pageAccessToken);
    }
  },

  setUserMode(senderId, mode) {
    userPreferences[senderId] = mode;

    // Réinitialiser la mémoire avec le nouveau mode
    userMemory[senderId] = [
      { role: "system", content: prompts[mode] },
    ];
  },
};
