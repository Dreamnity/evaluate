const { ActivityType } = require("discord.js");

module.exports = {
	name: "ready",
	once: true,
	/**
	 *
	 * @param {import('discord.js').Client} client
	 */
	execute(client) {
		let list = [
			ActivityType.Watching,
			ActivityType.Listening,
			ActivityType.Competing,
			ActivityType.Listening,
			ActivityType.Playing,
		];
		let activities = [
				"you hack me",
				`>/eval`,
				"hacking game",
				"/eval",
				"with eval()",
			],
			i = 0,
			tmp = 0;
		setInterval(
			() =>
				client.user.setActivity({
					name: `${activities[(tmp = i++ % activities.length)]}`,
					type: list[tmp],
					emoji: ":blush:",
					url: "https://twitch.tv/",
				}),
			22000
		);
	},
};
