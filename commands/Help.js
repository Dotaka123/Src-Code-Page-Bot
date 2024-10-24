module.exports.config = {
  name: 'help',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['info'],
  description: "Beginner's guide",
  usage: "Help [page] or [command]",
  credits: 'tata',
};

module.exports.run = async function({
  api,
  event,
  enableCommands,
  args,
  Utils,
  prefix
}) {
  const input = args.join(' ');
  try {
    const eventCommands = enableCommands[1].handleEvent;
    const commands = enableCommands[0].commands;
    if (!input) {
      const pages = 20;
      let page = 1;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = `🌟 📜 Commandes Disponibles 📜 🌟\n\n`;
      
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `🌟 ⭐️ ${i + 1}. 「 ${prefix}${commands[i]} 」\n`;
        helpMessage += `⇨ Description : ${commands[i].description}\n`;
        helpMessage += `___________________⭐___________________\n`;
      }
      
      helpMessage += '\n📜 📜 Page 1 / ' + Math.ceil(commands.length / pages) + ' 📜 📜\n';
      helpMessage += `Pour afficher la page suivante, tapez '${prefix}help [numéro de page]'.`;
      helpMessage += `\nPour plus d'informations sur une commande, tapez '${prefix}help [commande]'.`;

      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else if (!isNaN(input)) {
      const page = parseInt(input);
      const pages = 20;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = `🌟 📜 Commandes Disponibles 📜 🌟\n\n`;
      
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `🌟 ⭐️ ${i + 1}. 「 ${prefix}${commands[i]} 」\n`;
        helpMessage += `⇨ Description : ${commands[i].description}\n`;
        helpMessage += `___________________⭐___________________\n`;
      }

      helpMessage += `\n📜 📜 Page ${page} / ${Math.ceil(commands.length / pages)} 📜 📜`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else {
      const command = [...Utils.handleEvent, ...Utils.commands].find(([key]) => key.includes(input?.toLowerCase()))?.[1];
      if (command) {
        const {
          name,
          version,
          role,
          aliases = [],
          description,
          usage,
          credits,
          cooldown,
          hasPrefix
        } = command;
        const roleMessage = role !== undefined ? (role === 0 ? '➛ Permission: Utilisateur' : (role === 1 ? '➛ Permission: Admin' : (role === 2 ? '➛ Permission: Admin de discussion' : (role === 3 ? '➛ Permission: Super Admin' : '')))) : '';
        const aliasesMessage = aliases.length ? `➛ Alias: ${aliases.join(', ')}\n` : '';
        const descriptionMessage = description ? `⇨ Description : ${description}\n` : '';
        const usageMessage = usage ? `➛ Utilisation: ${usage}\n` : '';
        const creditsMessage = credits ? `➛ Crédit: ${credits}\n` : '';
        const versionMessage = version ? `➛ Version: ${version}\n` : '';
        const cooldownMessage = cooldown ? `➛ Délai: ${cooldown} seconde(s)\n` : '';

        const message = `🌟 Commande 🌟\n\n➛ Nom: ${name}\n${versionMessage}${roleMessage}\n${aliasesMessage}${descriptionMessage}${usageMessage}${creditsMessage}${cooldownMessage}`;
        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage('Commande introuvable.', event.threadID, event.messageID);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.handleEvent = async function({
  api,
  event,
  prefix
}) {
  const {
    threadID,
    messageID,
    body
  } = event;
  const message = prefix ? 'Voici mon préfixe : ' + prefix : "Désolé, je n'ai pas de préfixe.";
  if (body?.toLowerCase().startsWith('prefix')) {
    api.sendMessage(message, threadID, messageID);
  }
};
