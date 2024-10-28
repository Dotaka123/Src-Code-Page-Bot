const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'Help',
  description: 'Affiche les commandes du bot',
  author: 'Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');
    try {
      // Correction de l'erreur de typo dans l'ID du sender
      sendMessage(senderId, { text: `Salut user💓
Les commandes du bot sont:
-Pour discuter avec Miora
Babe [votre question]
-Pour rechercher des images:
Image [le nom de l'image]
-Pour rechercher les paroles d'une chanson:
Lyrics [le nom de la chanson]
-Extraire un texte dans un anime:
Quote
-Voir les previsions de la meteo:
Weather [lieu]
-Generer des insultes:
Insulte
-Voir les infos d'un perso de DA:
Da [le nom du perso]
-Traduire des textes:
Trans [traduire en quoi par exemple: en] [le texte a traduire]
Ex:Trans en Salut mon amour
-Discuter avec Gemini:
Gemini [votre question]
-Rechercher des chansons dans spotify:
spotify [le nom de la chanson]
-Generer des emails temporaires:
Ex: *Pour generer: tempmail gen
*Pour regarder les messages: tempmail [votre email generé]
by www.facebook.com/lahatra.gameur`}, pageAccessToken);
    } catch (error) {
      console.error(error);
      // Gestion de l'erreur si besoin
    }
  }
};
