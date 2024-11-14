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
  description: 'Générer une couverture Facebook personnalisée de manière interactive',
  author: 'Tata',
  usage:'Suivez les etapes que le bot dit😅',

  async execute(senderId, args) {
    const pageAccessToken = token;

    // Vérifier si l'utilisateur est déjà en train de remplir le formulaire
    if (!userStates[senderId]) {
      userStates[senderId] = {
        step: 0,
        data: {
          name: '',
          last: '',
          phone: '',
          country: '',
          email: '',
          uid: '',
          color: ''
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
        await sendMessage(senderId, { text: "📝 Entrez votre **prénom** :" }, pageAccessToken);
        userState.step++;
        break;

      case 2:
        // Récupérer le prénom et demander le téléphone
        userData.last = args.join(' ').trim();
        await sendMessage(senderId, { text: "📱 Entrez votre **numéro de téléphone** (ou 'n/a' si aucun) :" }, pageAccessToken);
        userState.step++;
        break;

      case 3:
        // Récupérer le téléphone et demander le pays
        userData.phone = args.join(' ').trim();
        await sendMessage(senderId, { text: "🌍 Entrez votre **pays** :" }, pageAccessToken);
        userState.step++;
        break;

      case 4:
        // Récupérer le pays et demander l'email
        userData.country = args.join(' ').trim();
        await sendMessage(senderId, { text: "📧 Entrez votre **email** (ou 'n/a' si aucun) :" }, pageAccessToken);
        userState.step++;
        break;

      case 5:
        // Récupérer l'email et demander l'UID Facebook
        userData.email = args.join(' ').trim();
        await sendMessage(senderId, { text: "🔗 Entrez votre **UID Facebook** :" }, pageAccessToken);
        userState.step++;
        break;

      case 6:
        // Récupérer l'UID et demander la couleur
        userData.uid = args.join(' ').trim();
        await sendMessage(senderId, { text: "🎨 Entrez une **couleur** pour votre couverture (ex: green, blue) :" }, pageAccessToken);
        userState.step++;
        break;

      case 7:
        // Récupérer la couleur et générer l'image
        userData.color = args.join(' ').trim();
        
        const path = 'cover.png';
        
        try {
          // Générer l'image avec les informations recueillies
          const image = await deku.fbcover(userData.name, userData.last, userData.phone, userData.country, userData.email, userData.uid, userData.color);
          
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
