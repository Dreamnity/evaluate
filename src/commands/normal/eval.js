const run = require('../../api/safe-eval');
const fs = require('fs');
let globs = {};
fs.readdirSync(__dirname + '/../../api/').forEach(
  (e) =>
    (globs[e.substring(0, e.length - 3)] = require(__dirname +
      '/../../api/' +
      e))
);
module.exports = {
  name: 'eval',
  aliases: ['exec'],
  //cooldown: 5000,
  run: async (client, message, args) => {
    try {
      let code = (typeof args === 'string' ? args : args.join(' '));
      code = ((the=code.match(/```(?:js\n)?(.+)```/ms))?the[1]:code).replace(/import\((.+)\)/,'require($1)');
      console.log(code);
      let result = (
        await run(code, {
          timeout: 5000,
          allowUnchecked: message.author.id == '793391165688119357',
          globals: { client, message, args, ...globs }
        })
      )
        .toString()
        .match(/.{1,1950}$/gms);
      const haveNL = result.join('').includes('\n');
      result.forEach((e, i) => {
        if (i == 0)
          message.reply(haveNL ? '```js\n' + e + '```' : '`' + e + '`');
        else
          message.channel.send(haveNL ? '```js\n' + e + '```' : '`' + e + '`');
      });
    } catch (e) {
      message.reply(
        'An error has occured while executing:```js\n' +
          (message.author.id == '793391165688119357' ? e.stack : e.message) +
          '```'
      );
    }
  }
};
