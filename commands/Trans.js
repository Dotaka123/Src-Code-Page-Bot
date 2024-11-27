import { detect, checkDetectorUsability, translate, checkTranslatorUsability } from '@rejax/browser-ai';
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'trans',
  description: 'Translation functionality with language detection and supported languages list.',
  author: 'Tata',

  async execute(senderId, args) {
    // Si la commande est "trans list", afficher toutes les langues supportées
    if (args[0] === 'list') {
      const supportedLanguages = [
        'en', // English
        'fr', // Français
        'es', // Español
        'de', // Deutsch
        'it', // Italiano
        'pt', // Português
        'ru', // Русский
        'zh', // 中文
        'ja', // 日本語
        'ar', // العربية
        // Ajoutez ici d'autres langues selon vos besoins
      ];

      const languageList = supportedLanguages.join(', ');

      await sendMessage(senderId, {
        text: `Les langues supportées pour la traduction sont : ${languageList}`,
      });
      return;
    }

    // Vérifier qu'il y a suffisamment d'arguments
    if (args.length < 2) {
      return await sendMessage(senderId, {
        text: 'Format incorrect. Utilisez : trans <texte> <langue-cible>. Exemple : trans Hello world fr',
      });
    }

    const textToTranslate = args.slice(0, -1).join(' '); // Le texte à traduire
    const targetLanguage = args[args.length - 1]; // La langue cible (ex : "fr", "es")

    try {
      // Vérifier la disponibilité de la détection de la langue
      const usability = await checkDetectorUsability();
      if (!usability.available) {
        return await sendMessage(senderId, {
          text: 'Désolé, la détection de langue n\'est pas disponible.',
        });
      }

      // Détecter la langue du texte
      const detectedLanguageResult = await detect(textToTranslate);
      const sourceLanguage = detectedLanguageResult.value;

      if (sourceLanguage === targetLanguage) {
        return await sendMessage(senderId, {
          text: `Le texte est déjà dans la langue cible (${targetLanguage}).`,
        });
      }

      // Vérifier la disponibilité de la traduction
      const usabilityTranslate = await checkTranslatorUsability({
        sourceLanguage,
        targetLanguage,
      });
      if (!usabilityTranslate.available) {
        return await sendMessage(senderId, {
          text: `Désolé, la traduction de ${sourceLanguage} vers ${targetLanguage} n'est pas disponible.`,
        });
      }

      // Traduire le texte
      const translatedText = await translate({
        text: textToTranslate,
        sourceLanguage,
        targetLanguage,
      });

      // Envoyer le texte traduit
      await sendMessage(senderId, {
        text: `Traduction (${sourceLanguage} -> ${targetLanguage}): ${translatedText}`,
      });
    } catch (error) {
      console.error('Erreur lors de la détection ou de la traduction:', error);
      await sendMessage(senderId, {
        text: 'Désolé, une erreur s\'est produite lors de la détection ou de la traduction.',
      });
    }
  }
};
