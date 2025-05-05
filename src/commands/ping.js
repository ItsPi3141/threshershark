const { SlashCommandBuilder } = require("discord.js");
const { getPage } = require("../tools/fetch.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Display the bot's latency"),
	async execute(
		/** @type {import("discord.js").Interaction} */ interaction,
		/** @type {import("discord.js").Client} */ client,
	) {
		const t1_discord = Date.now();
		await interaction.reply(`${config.emojis.loading} Calculating ping...`);
		const t2_discord = Date.now();

		const t1_api = Date.now();
		await getPage("https://api.deeeep.io/pets");
		const t2_api = Date.now();
		const t1_db = Date.now();
		await getPage("https://api.deeeep.io/users/5");
		const t2_db = Date.now();

		interaction.editReply(
			[
				`Discord: \`${Math.round(t2_discord - t1_discord)}ms\``,
				`Deeeep.io (static data): \`${Math.round(t2_api - t1_api)}ms\``,
				`Deeeep.io (database query): \`${Math.round(t2_db - t1_db)}ms\``,
			].join("\n"),
		);
	},
};
