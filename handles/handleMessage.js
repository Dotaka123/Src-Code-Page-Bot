const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const prefix = '-';

// Load command modules
fs.readdirSync(path.join(__dirname, '../commands'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(`../commands/${file}`);
    commands.set(command.name.toLowerCase(), command);
  });

async function handleMessage(event, pageAccessToken) {
  const senderId = event?.sender?.id;
  if (!senderId) return console.error('Invalid event object');

  const messageText = event?.message?.text?.trim();
  if (!messageText) return console.log('Received event without message text');

  const [commandName, ...args] = messageText.startsWith(prefix)
    ? messageText.slice(prefix.length).split(' ')
    : messageText.split(' ');

  try {
    if (commands.has(commandName.toLowerCase())) {
      // Execute the corresponding command
      await commands.get(commandName.toLowerCase()).execute(senderId, args, pageAccessToken, sendMessage);
    } else {
      // Handle unknown commands
      await sendMessage(senderId, { text: `Commande inconnue. Tapez '-help' pour voir la liste des commandes disponibles.` }, pageAccessToken);
    }
  } catch (error) {
    console.error(`Error executing command:`, error);
    await sendMessage(senderId, { text: error.message || 'Il y a eu une erreur en exécutant cette commande.' }, pageAccessToken);
  }
}

module.exports = { handleMessage };
