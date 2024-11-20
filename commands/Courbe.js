const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage'); // Adapter en fonction de votre structure
const fs = require('fs');
const { exec } = require('child_process');

// Lire le token d'authentification de la page
const token = fs.readFileSync('token.txt', 'utf8');

// Générer l'image de la courbe
const generateGraph = (functionString, filePath) => {
  return new Promise((resolve, reject) => {
    const code = `
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-10, 10, 400)
y = ${functionString}

plt.plot(x, y)
plt.title('Graph of ${functionString}')
plt.xlabel('x')
plt.ylabel('y')
plt.grid(True)
plt.savefig('${filePath}')
plt.close()
`;

    fs.writeFileSync('plot_code.py', code, 'utf8');

    exec('python3 plot_code.py', (error, stdout, stderr) => {
      if (error || stderr) {
        reject('Error generating graph');
      } else {
        resolve();
      }
    });
  });
};

// Commande principale
module.exports = {
  name: 'courbe',
  description: 'Generate and send a graph of a function',
  author: 'Tata',
  usage:'courbe np.[your fonction]',

  async execute(senderId, args) {
    const functionString = args.join(' ') || 'np.sin(x)';
    const filePath = './graph.png';

    try {
      // Générer la courbe et sauvegarder l'image
      await generateGraph(functionString, filePath);

      // Envoyer l'image via Messenger
      const image = fs.createReadStream(filePath);
      const form = new FormData();
      form.append('filedata', image);
      form.append('recipient', senderId);
      form.append('access_token', token);

      await axios.post('https://graph.facebook.com/v12.0/me/messages', form, {
        headers: form.getHeaders(),
      });

      // Supprimer le fichier de l'image après l'envoi
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Il y a eu une erreur lors de la génération de la courbe.' }, token);
    }
  }
};
