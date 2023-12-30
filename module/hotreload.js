const fs = require("node:fs");
const path = require("node:path");
const chalk = require('chalk');
const prefix = `[${chalk.cyan('HMR')}] `
const slashpath = path.resolve(__dirname, "..", "src/commands/slash"),
	normalpath = path.resolve(__dirname, "..", "src/commands/normal");
const cmds = fs
	.readdirSync(slashpath)
	.map(e => ({
		file: e,
		name: require(path.resolve(slashpath + "/" + e))?.data?.name,
	}));
const ncmds = fs
	.readdirSync(normalpath)
	.map(e => ({
		file: e,
		...require(path.resolve(normalpath + "/" + e)),
	}));
cmds.forEach(e => e?.name || console.error(`${prefix}${chalk.red(e.file)}: ${chalk.red('invalid')} slash command.`));
ncmds.forEach(e => e?.name || console.error(`${prefix}${chalk.red(e.file)}: ${chalk.red('invalid')} command.`));
var lastreloaded = {};
if (process.argv.includes('--production')) {
	console.log(`${prefix}${chalk.red('HMR Disabled in production')}`)
} else {
	/**
	 * uwu
	 * @param {import('discord.js').Client} client a
	 */
	module.exports = client => {
		try {
			const slash = fs.watch(slashpath);
			const normal = fs.watch(normalpath);
			slash
				.on("change", (type, file) => {
					let idx = cmds.findIndex(e => e.file === file);
					if (idx === -1) return;
					let oldcmd = cmds[idx];
					if (Date.now() - (lastreloaded[oldcmd?.name] || 0) < 1000) return;
					lastreloaded[oldcmd.name] = Date.now();
					if (type === "remove") {
						return client.slashcommands.delete(oldcmd);
					}
					delete require.cache[require.resolve(slashpath + "/" + file)];
					try {
						client.slashcommands.delete(oldcmd);
						var newcmd;
						try {
							newcmd = require(slashpath + "/" + file);
						}
						catch (e) {
							return console.error(`${prefix}${chalk.yellow('Cannot')} reload(/) ${chalk.blueBright(file)}:\n`, e);
						}
						client.slashcommands.set(newcmd.data.name, newcmd);
						if(newcmd===oldcmd) return;
						console.log(`${prefix}Reloaded(/) ${chalk.blueBright(file)} ${chalk.green('successfully')}`);
						cmds[idx] = { file, ...newcmd }
					} catch (e) {
						client.slashcommands.set(oldcmd.data.name, oldcmd);
						console.error(`${prefix}${chalk.yellow('Cannot')} reload(/) ${chalk.blueBright(file)}:\n`, e);
					}
				})
				.on("error", e => console.error(`${prefix}${chalk.yellow('Cannot')} watch(/):\n`, e));
			console.log(`${prefix}Watching ${slashpath} for slash commands`);
			normal
				.on("change", (type, file) => {
					let oldcmd = ncmds.find(e => e.file === file);
					if (type === "remove") {
						return client.commands.delete(oldcmd);
					}
					delete require.cache[require.resolve(normalpath + "/" + file)];
					try {
						client.commands.delete(oldcmd.name);
						const newcmd = require(normalpath + "/" + file);
						client.commands.set(newcmd.name, newcmd);
						console.log("[HMR] Reloaded(>) " + file + " successfully");
					} catch (e) {
						console.error("[HMR] Cannot reload(>) " + file + ":\n", e);
					}
				})
				.on("error", e => console.error("[HMR] Cannot watch(>):\n", e));
			console.log("[HMR] Watching " + normalpath + " for normal commands");
		} catch (e) {
			console.error("[HMR] Error while initialize:\n", e);
		}
	};
}