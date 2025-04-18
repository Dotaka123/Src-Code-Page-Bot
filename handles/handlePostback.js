const axios = require('axios');
const { sendMessage } = require('./sendMessage'); // Assurez-vous que ce chemin est correct
const { setUserMode } = require('../commands/gpt4'); // Vérifiez également ce chemin
const SYTDL = require('s-ytdl'); // Utilisation de require au lieu de import

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) {
    console.error('Invalid postback event object');
    return;
  }

  try {
    if (payload === 'WELCOME_MESSAGE') {
      const welcomeMessage = '🇫🇷 Bienvenue dans l\'univers de Girlfriend AI 🌟!\nChoisissez votre mode de conversation pour commencer :';

      const buttons = [
        {
          type: 'postback',
          title: 'Mode fille 💖',
          payload: 'MODE_FILLE'
        },
        {
          type: 'postback',
          title: 'Mode garçon 💙',
          payload: 'MODE_GARCON'
        },
        {
          type: 'postback',
          title: 'Mode normal 🧠',
          payload: 'MODE_SENKU'
        }
      ];

      await sendMessage(senderId, { text: welcomeMessage, buttons }, pageAccessToken);
    }

    else if (payload === 'MODE_FILLE') {
      setUserMode(senderId, 'fille');
      await sendMessage(senderId, { text: 'Mode fille activé ! 💕 Parlez avec Miora !' }, pageAccessToken);
    }

    else if (payload === 'MODE_GARCON') {
      setUserMode(senderId, 'garcon');
      await sendMessage(senderId, { text: 'Mode garçon activé ! 💙 Parlez avec Nario !' }, pageAccessToken);
    }

    else if (payload === 'MODE_SENKU') {
      setUserMode(senderId, 'senku');
      await sendMessage(senderId, { text: 'Mode normal activé ! 🧠 Posez vos questions à GPT-4o !' }, pageAccessToken);
    }

    else if (payload.startsWith('LISTEN_AUDIO_')) {
      const videoId = payload.split('_')[2];
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      try {
        await sendMessage(senderId, { text: 'Téléchargement de l\'audio en cours...' }, pageAccessToken);

        const audio = await SYTDL.dl(videoUrl, '4', 'audio'); // Qualité 192kbps

        if (audio && audio.url) {
          await sendMessage(
            senderId,
            {
              attachment: {
                type: 'audio',
                payload: { url: audio.url }
              }
            },
            pageAccessToken
          );
        } else {
          await sendMessage(senderId, { text: 'Impossible de récupérer l\'audio.' }, pageAccessToken);
        }
      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'audio:', error.message);
        await sendMessage(senderId, { text: 'Erreur lors du téléchargement de l\'audio.' }, pageAccessToken);
      }
    }

    // 🔽 Téléchargement d'APK
    else if (payload.startsWith('DOWNLOAD_APK|')) {
      const appPageUrl = payload.split('|')[1];

      try {
        await sendMessage(senderId, { text: '🔍 Récupération de l\'APK, un instant...' }, pageAccessToken);

        const res = await axios.get(appPageUrl);
        const cheerio = require('cheerio');
        const $ = cheerio.load(res.data);

        const downloadBtn = $('.ny-down .da a').first();
        if (!downloadBtn.length) {
          return sendMessage(senderId, { text: '❌ Lien de téléchargement non trouvé.' }, pageAccessToken);
        }

        const downloadPage = 'https://apkpure.com' + downloadBtn.attr('href');
        const res2 = await axios.get(downloadPage);
        const _$ = cheerio.load(res2.data);
        const finalLink = _$('.download-btn').attr('href');

        if (!finalLink) {
          return sendMessage(senderId, { text: '❌ Impossible de récupérer le lien de téléchargement final.' }, pageAccessToken);
        }

        const fs = require('fs');
        const path = require('path');
        const FormData = require('form-data');
        const filePath = path.join(__dirname, 'temp.apk');
        const writer = fs.createWriteStream(filePath);

        const fileRes = await axios.get(finalLink, { responseType: 'stream' });
        fileRes.data.pipe(writer);

        writer.on('finish', async () => {
          const form = new FormData();
          form.append('recipient', JSON.stringify({ id: senderId }));
          form.append('message', JSON.stringify({
            attachment: { type: 'file', payload: {} }
          }));
          form.append('filedata', fs.createReadStream(filePath));

          await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`, form, {
            headers: form.getHeaders()
          });

          fs.unlinkSync(filePath);
        });

        writer.on('error', () => {
          sendMessage(senderId, { text: '🚫 Erreur pendant le téléchargement du fichier.' }, pageAccessToken);
        });

      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'APK:', error.message);
        await sendMessage(senderId, { text: '❌ Une erreur est survenue pendant le téléchargement de l\'APK.' }, pageAccessToken);
      }
    }

    else {
      await sendMessage(senderId, { text: `Postback inconnu : ${payload}` }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error handling postback:', error.message);

    if (typeof sendMessage === 'function') {
      await sendMessage(senderId, { text: 'Une erreur est survenue. Veuillez réessayer.' }, pageAccessToken);
    } else {
      console.error('sendMessage is not defined or is not a function.');
    }
  }
};

module.exports = { handlePostback };
