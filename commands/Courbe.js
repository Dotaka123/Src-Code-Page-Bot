const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'courbe',
  description: 'Generate a mathematical curve',
  author: 'Tata',

  async execute(senderId, args) {
    if (args.length === 0) {
      return await sendMessage(senderId, {
        text: 'Format incorrect. Utilisez : courbe <fonction>. Exemple : courbe y=x^2',
      });
    }

    const equation = args.join(' '); // La fonction mathématique (ex: y=x^2)
    const apiUrl = 'https://quickchart.io/chart';

    // Configuration pour le graphique
    const chartConfig = {
      type: 'line',
      data: {
        datasets: [
          {
            label: `Graph: ${equation}`,
            data: Array.from({ length: 100 }, (_, x) => {
              x = (x - 50) / 10; // Centrer autour de 0 (-5 à 5)
              try {
                const y = eval(equation.replace('x', `(${x})`)); // Évalue y en fonction de x
                return { x, y };
              } catch {
                return null;
              }
            }).filter((point) => point !== null),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: { type: 'linear', position: 'bottom' },
          y: { type: 'linear' },
        },
        plugins: {
          title: {
            display: true,
            text: `Courbe de ${equation}`,
          },
        },
      },
    };

    try {
      // Générer l'image du graphique avec QuickChart API
      const response = await axios.post(apiUrl, {
        chart: chartConfig,
        width: 800,
        height: 400,
        format: 'png',
      });

      const imageUrl = response.data.url;

      // Envoyer l'image générée au bot
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: imageUrl,
          },
        },
      });
    } catch (error) {
      console.error('Erreur lors de la génération de la courbe:', error);
      await sendMessage(senderId, {
        text: 'Erreur lors de la génération de la courbe. Veuillez vérifier votre fonction.',
      });
    }
  },
};
