const { GiftedGpt } = require("gifted-gpt");
const fs = require("fs");
const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

const gpt4 = new GiftedGpt();
const token = fs.readFileSync("token.txt", "utf8");

module.exports = {
  name: "generate",
  description: "Générer une image basée sur une description donnée",
  author: "Tata",
  usage:"generate [your prompt]",

  async execute(senderId, args) {
    const pageAccessToken = token;
    const prompt = args.join(" ").trim();

    // Vérification si le prompt est vide
    if (!prompt) {
      await sendMessage(
        senderId,
        { text: "🖼️ Veuillez fournir une description pour générer une image." },
        pageAccessToken
      );
      return;
    }

    const path = "generated_image.jpg";

    try {
      // Générer l'image avec GiftedGpt
      const base64Image = await gpt4.imageGeneration(prompt, {
        debug: true,
        provider: gpt4.providers.Emi,
      });

      // Sauvegarder l'image en local
      fs.writeFileSync(path, base64Image, { encoding: "base64" });

      // Préparer l'image pour envoi à Messenger
      const formData = {
        recipient: { id: senderId },
        message: {
          attachment: {
            type: "image",
            payload: {},
          },
        },
        filedata: fs.createReadStream(path),
      };

      // Envoyer l'image générée à l'utilisateur
      await axios.post(
        `https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Confirmation à l'utilisateur
      await sendMessage(
        senderId,
        { text: "✅ L'image a été générée avec succès !" },
        pageAccessToken
      );
    } catch (error) {
      console.error("Erreur lors de la génération de l'image :", error.message);
      await sendMessage(
        senderId,
        {
          text: "❌ Une erreur est survenue lors de la génération de l'image.",
        },
        pageAccessToken
      );
    }
  },
};
