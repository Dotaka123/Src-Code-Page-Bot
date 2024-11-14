const Deku = require("dekuai");
const deku = new Deku();
const fs = require('fs');
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const token = fs.readFileSync('token.txt', 'utf8');

// Stockage temporaire des informations utilisateur
const userStates = {};

module.exports = {
  name: 'cover',
  description: 'Générer une couverture Facebook personnalisée avec fbcoverv4',
  author: 'Tata',

  async execute(senderId, args) {
    const pageAccessToken = token;

    // Vérifier si l'utilisateur est déjà en train de remplir le formulaire
    if (!userStates[senderId]) {
      userStates[senderId] = {
        step: 0,
        data: {
          name: '',
          subname: '',
          id: ''
        }
      };
    }

    const userState = userStates[senderId];
    const step = userState.step;
    const userData = userState.data;

    // Traitement en fonction de l'étape actuelle
    switch (step) {
      case 0:
        // Demander le nom
        await sendMessage(senderId, { text: "👤 Entrez votre **nom** :" }, pageAccessToken);
        userState.step++;
        break;

      case 1:
        // Récupérer le nom et demander le prénom
        userData.name = args.join(' ').trim();
        await sendMessage(senderId, { text: "📝 Entrez votre **sous-nom** (subname) :" }, pageAccessToken);
        userState.step++;
        break;

      case 2:
        // Récupérer le subname et demander l'ID
        userData.subname = args.join(' ').trim();
        await sendMessage(senderId, { text: "🔢 Entrez votre **ID** (ex: 3) :" }, pageAccessToken);
        userState.step++;
        break;

      case 3:
        // Récupérer l'ID et générer l'image
        userData.id = parseInt(args.join(' ').trim(), 10);
        
        if (isNaN(userData.id)) {
          await sendMessage(senderId, { text: "❌ L'ID doit être un nombre valide. Veuillez recommencer." }, pageAccessToken);
          delete userStates[senderId]; // Réinitialiser en cas d'erreur
          return;
        }

        const path = 'fbcover4.png';
        
        try {
          // Générer l'image avec les informations recueillies
          const image = await deku.fbcoverv4(userData.name, userData.id, userData.subname);
          
          // Sauvegarder l'image localement
          fs.writeFileSync(path, image);

          // Préparer le fichier à envoyer
          const formData = {
            recipient: { id: senderId },
            message: {
              attachment: {
                type: 'image',
                payload: {}
              }
            },
            filedata: fs.createReadStream(path)
          };

          // Envoyer l'image générée à l'utilisateur
          await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          await sendMessage(senderId, { text: "✅ Votre couverture a été générée avec succès !" }, pageAccessToken);

        } catch (error) {
          console.error('Erreur lors de la génération de l\'image:', error.message);
          await sendMessage(senderId, { text: '❌ Une erreur est survenue lors de la génération de votre couverture.' }, pageAccessToken);
        }

        // Réinitialiser l'état de l'utilisateur
        delete userStates[senderId];
        break;

      default:
        await sendMessage(senderId, { text: "Commande non reconnue. Veuillez recommencer." }, pageAccessToken);
        delete userStates[senderId];
        break;
    }
  }
};
