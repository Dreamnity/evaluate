const run = require("../../api/safe-eval");
const fs = require("fs");
const { SlashCommandBuilder } = require("discord.js");
const pe = new (require("pretty-error"))();
let globs = {};
fs.readdirSync(__dirname + "/../../api/").forEach(
	e =>
		(globs[e.substring(0, e.length - 3)] = require(__dirname +
			"/../../api/" +
			e))
);
module.exports = {
	defer: true,
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Evaluate javascript code(Extremely sandboxed)")
		.addStringOption(option =>
			option.setName("code").setDescription("The javascript code")
		),
	run: async (client, interaction) => {
		if (
			!process.argv.includes("--production") &&
			interaction?.user?.id !== "793391165688119357"
		)
			return interaction.reply(
				"Evaluate is under maintenance.(development mode)"
			);
		try {
			let code = interaction.options.getString("code");
			console.log(interaction.user.username + ": " + code);
			let result = (
				await run(code, {
					timeout: 5000,
					allowUnchecked: interaction.user.id == "793391165688119357",
          globals: { client, message: interaction, ...globs },
          userId:interaction.user.id
				})
			)
				.toString()
				.match(/.{1,1950}$/gms);
			const haveNL = result.join("").includes("\n");
			result.forEach((e, i) => {
				if (i == 0)
					interaction.editReply(haveNL ? "```js\n" + e + "```" : "`" + e + "`");
				else
					interaction.channel.send(
						haveNL ? "```js\n" + e + "```" : "`" + e + "`"
					);
			});
		} catch (e) {
			let text =
				"An error has occured while executing:```ansi\n" + pe.render(e) + "```";
			if (text.length > 2000) text = text.replace(/\n\n/g, "\n");
			if (text.length > 2000)
				text =
					text.replace(/\\x1B\[[0-9]{1,3}m/gm, "") +
					"\n[Color disabled due to large error)";
			if (text.length > 2000)
				text = "`" + e.message.substr(0,1970) + "`" + "\n[Error too large]";
			interaction.editReply(text);
		}
	},
};
