const run = require('../../api/safe-eval');
const fs = require('fs');
const {SlashCommandBuilder} = require('discord.js')
let globs = {};
fs.readdirSync(__dirname + '/../../api/').forEach(
  (e) =>
    (globs[e.substring(0, e.length - 3)] = require(__dirname +
      '/../../api/' +
      e))
);
module.exports = {
    defer: true,
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate javascript code(Extremely sandboxed)')
        .addStringOption(option=>
            option
                .setName('code')
                .setDescription('The javascript code')
        ),
  run: async (client, interaction) => {
    try {
      let code = interaction.options.getString('code');
      let result = (
        await run(code, {
          timeout: 5000,
          allowUnchecked: interaction.user.id == '793391165688119357',
          globals: { client, message: interaction, ...globs }
        })
      )
        .toString()
        .match(/.{1,1950}$/gms);
      const haveNL = result.join('').includes('\n');
      result.forEach((e, i) => {
        if (i == 0)
          interaction.editReply(haveNL ? '```js\n' + e + '```' : '`' + e + '`');
        else
          interaction.channel.send(haveNL ? '```js\n' + e + '```' : '`' + e + '`');
      });
    } catch (e) {
      interaction.editReply(
        'An error has occured while executing:```ansi\n' +
          (pe.render(e)) +
          '```'
      );
    }
  }
};