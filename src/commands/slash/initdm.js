const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('init-dm')
        .setDescription('Make bot be able to evaluate code in your DM.'),
    run: (client, interaction) => {
        return interaction.user.createDM().then(interaction.reply.bind(null,[{content:'Successfully bound DM handler to your DM!',ephemeral:!!interaction.guild}]));
    }
}