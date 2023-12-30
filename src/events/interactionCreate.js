const { InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {import('discord.js').BaseInteraction} interaction
	 */
  execute: async (interaction) => {
    if (interaction.isChatInputCommand()) {
      let client = interaction.client;
      if (interaction.type == InteractionType.ApplicationCommand) {
        if (interaction.user.bot) return;
        try {
          const command = client.slashcommands.get(interaction.commandName);
					if (!command)
						console.error(
							`[Default interaction handler] No command matching ${interaction.commandName} was found.`
						);
					if (command.defer)
						await interaction.deferReply(
							command.defer == true ? { fetchReply: true } : command.defer
						);
					command.run(client, interaction);
				} catch (error) {
					console.log(error);
					const command = client.slashcommands.get(interaction.commandName);
					if (command && !interaction.deferred)
						interaction[command.defer ? followUp : reply](
							`\`\`\`\n${error.stack}\n\`\`\``
						);
				}
      }
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.slashcommands.get(
        interaction.commandName
      );

      if (!command) {
        console.error(
          `[Default interaction handler] No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      if (command.autocomplete) await command.autocomplete(interaction);
      else console.error(
          `[Default interaction handler] No command matching ${interaction.commandName} was found.`
        );
    } else if (interaction.isButton()) {
      const command = interaction.client.slashcommands.get(
        interaction.message.interaction?.commandName.split(" ")[0] || interaction.customId
      );
// i still cant see my commits in this code
      if (!command) {
        console.error(
          `[Default interaction handler] No button matching ${
            interaction.message.interaction?.commandName.split(" ")[0] || interaction.customId
          } was found.`
        );
        return;
      }

      if (command.button) await command.button(interaction);
      else console.error(
          `[Default interaction handler] No button matching ${
            interaction.message.interaction?.commandName.split(" ")[0] || interaction.customId
          } was found.`
        );
    } else if (interaction.isStringSelectMenu()) {
      const command = interaction.client.slashcommands.get(
        interaction.message.interaction?.commandName.split(" ")[0] || interaction.customId
      );

      if (!command) {
        console.error(
          `[Default interaction handler] No selectmenu matching ${
            interaction.message.interaction?.commandName.split(" ")[0] || interaction.customId
          } was found.`
        );
        return;
      }

      if (command.selectMenu) await command.selectMenu(interaction);
      else console.error(
          `[Default interaction handler] No selectmenu matching ${
            interaction.message.interaction?.commandName.split(" ")[0] || interaction.customId
          } was found.`
        );
    } 
  }
};