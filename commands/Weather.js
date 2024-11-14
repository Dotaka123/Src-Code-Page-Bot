const { getWeather } = require("weathers-watch");
const { sendMessage } = require("../handles/sendMessage");
const fs = require("fs");

const token = fs.readFileSync("token.txt", "utf8");

module.exports = {
  name: "weather",
  description: "Obtenez la météo actuelle d'un lieu",
  author: "Tata",

  async execute(senderId, args) {
    const pageAccessToken = token;
    const locationQuery = args.join(" ").trim();

    // Vérifier si l'utilisateur a fourni un lieu
    if (!locationQuery) {
      await sendMessage(
        senderId,
        { text: "🌍 Veuillez fournir le nom d'une ville pour obtenir la météo (ex: `meteo Paris`)." },
        pageAccessToken
      );
      return;
    }

    try {
      // Appel à l'API pour obtenir la météo
      const weatherResult = await getWeather(locationQuery);

      if (!weatherResult || !weatherResult.currentWeather) {
        await sendMessage(
          senderId,
          { text: `❌ Désolé, aucune donnée météo n'est disponible pour "${locationQuery}".` },
          pageAccessToken
        );
        return;
      }

      // Extraction des informations depuis la réponse de l'API
      const { location, locationDetail, currentWeather, forecastSummary } = weatherResult;

      // Formatage des informations météo actuelles
      const currentWeatherInfo = `
🌤️ **Météo pour ${location}, ${locationDetail}** 🌤️
- Température : ${currentWeather.temperature}
- Point de rosée : ${currentWeather.dewPoint}
- Pression atmosphérique : ${currentWeather.barometer}
- Vent : ${currentWeather.wind}
- Humidité : ${currentWeather.humidity}
- Dernière mise à jour : ${currentWeather.time}
      `;

      // Formatage du résumé des prévisions
      let forecastInfo = "**Prévisions à venir :**\n";
      forecastSummary.forEach((forecast) => {
        forecastInfo += `\n📅 ${forecast.day} (${forecast.date}) : ${forecast.result}, Min: ${forecast.min || "N/A"}, Max: ${forecast.max || "N/A"}`;
      });

      // Envoi du message formaté à l'utilisateur
      const formattedMessage = `${currentWeatherInfo}\n\n${forecastInfo}`;

      await sendMessage(
        senderId,
        { text: formattedMessage },
        pageAccessToken
      );

    } catch (error) {
      console.error("Erreur lors de la récupération de la météo :", error.message);
      await sendMessage(
        senderId,
        { text: "❌ Une erreur est survenue lors de la récupération de la météo. Veuillez réessayer plus tard." },
        pageAccessToken
      );
    }
  },
};
