module.exports = {
	name: "messageCreate",
	execute: async msg => {
		if (msg.inGuild() || msg.author.bot) return;
		msg.client.commands.get("eval").run(msg.client, msg, msg.content);
	},
};
