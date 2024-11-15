const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const { setUserMode } = require('../commands/gpt4');
const { userDefaults } = require('./handlePostback'); // Importer la Map des utilisateurs et leurs modes

const prefix = '-';
const commands = new Map();
const fs = require('fs');
const path = require('path');

// Charger les modules de commande
fs.readdirSync(path.join(__dirname, '../commands'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(`../commands/${file}`);
    commands.set(command.name.toLowerCase(), command);
});

// Fonction pour gérer les messages entrants
async function handleMessage(event, pageAccessToken) {
  const senderId = event?.sender?.id;
  if (!senderId) return console.error('Invalid event object');

  const messageText = event?.message?.text?.trim();
  if (!messageText) return console.log('Received event without message text');

  const [commandName, ...args] = messageText.startsWith(prefix)
    ? messageText.slice(prefix.length).split(' ')
    : messageText.split(' ');

  try {
    // Si la commande "help" est appelée, afficher l'aide et les Quick Replies
    if (commandName.toLowerCase() === 'help') {
      const commandsDir = path.join(__dirname, '../commands');
      const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

      if (args.length > 0) {
        const commandName = args[0].toLowerCase();
        const commandFile = commandFiles.find(file => {
          const command = require(path.join(commandsDir, file));
          return command.name.toLowerCase() === commandName;
        });

        if (commandFile) {
          const command = require(path.join(commandsDir, commandFile));
          const commandDetails = `
━━━━━━━━━━━━━━
𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝙽𝚊𝚖𝚎: ${command.name}
𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗: ${command.description}
𝚄𝚜𝚊𝚐𝚎: ${command.usage}
━━━━━━━━━━━━━━`;
          
          await sendMessage(senderId, { text: commandDetails }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: `Command "${commandName}" not found.` }, pageAccessToken);
        }
        return;
      }

      const commands = commandFiles.map(file => {
        const command = require(path.join(commandsDir, file));
        return `│ - ${command.name}`;
      });

      const helpMessage = `
━━━━━━━━━━━━━━
𝙰𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜:
╭─╼━━━━━━━━╾─╮
${commands.join('\n')}
╰─━━━━━━━━━╾─╯
Chat -help [name] 
to see command details.
Admin: www.facebook.com/lahatra.gameur
━━━━━━━━━━━━━━`;

      // Envoyer le message d'aide
      await sendMessage(senderId, { text: helpMessage }, pageAccessToken);

      // Ajouter les Quick Replies pour "Gpt4" et "Hercai"
      const quickReplies = [
        {
          content_type: 'text',
          title: 'Gpt4',
          payload: 'GPT4'
        },
        {
          content_type: 'text',
          title: 'Hercai',
          payload: 'HERCAI'
        }
      ];

      // Envoyer les Quick Replies
      await sendMessage(senderId, { text: 'Sélectionnez un mode pour continuer :', quick_replies: quickReplies }, pageAccessToken);

    } else {
      // Gestion des autres commandes
      if (commands.has(commandName.toLowerCase())) {
        await commands.get(commandName.toLowerCase()).execute(senderId, args, pageAccessToken, sendMessage);
      } else {
        // Commande par défaut en cas de commande non trouvée
        const defaultMode = userDefaults.get(senderId) || 'gpt4'; // Si aucun mode sélectionné, utiliser 'gpt4' par défaut
        const command = require(`../commands/${defaultMode}`);
        await command.execute(senderId, [messageText], pageAccessToken, sendMessage);
      }
    }
  } catch (error) {
    console.error(`Error executing command:`, error);
    await sendMessage(senderId, { text: error.message || 'There was an error executing that command.' }, pageAccessToken);
  }
}

module.exports = { handleMessage };
