const run = require("../../api/safe-eval");
const fs = require("fs");
const pe = new (require("pretty-error"))();
let globs = {};
fs.readdirSync(__dirname + "/../../api/").forEach(
	e =>
		(globs[e.substring(0, e.length - 3)] = require(__dirname +
			"/../../api/" +
			e))
);
module.exports = {
	name: "eval",
	aliases: ["exec"],
	//cooldown: 5000,
	run: async (client, message, args) => {
		try {
			if (
				!process.argv.includes("--production") &&
				message.author.id !== "793391165688119357"
			)
				return message.reply(
					"Evaluate is under maintenance.(development mode)"
				);
			let code = typeof args === "string" ? args : args.join(" ");
			code = (
				(the = code.match(/```(?:js\n)?(.+)```/ms)) ? the[1] : code
			).replace(/import\((.+)\)/, "require($1)");
			console.log(message.author.username + ": " + code);
			let result = (
				await run(code, {
					timeout: 5000,
					allowUnchecked: message.author.id == "793391165688119357",
					globals: { client, message, args, ...globs },
				})
			)
				.toString()
				.match(/.{1,1950}$/gms);
			const haveNL = result.join("").includes("\n");
			result.forEach((e, i) => {
				if (i == 0)
					message.reply(haveNL ? "```js\n" + e + "```" : "`" + e + "`");
				else
					message.channel.send(haveNL ? "```js\n" + e + "```" : "`" + e + "`");
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
			message.reply(text);
		}
	},
};
