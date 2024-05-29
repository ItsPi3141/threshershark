const { SlashCommandBuilder } = require("discord.js");
const bypassCloudflare = require("../tools/bypassCloudflare.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Display the bot's latency"),
	async execute(/** @type {import("discord.js").Interaction} */ interaction, /** @type {import("discord.js").Client} */ client) {
		const t1 = Date.now();
		await bypassCloudflare.getPage("https://apibeta.deeeep.io/users/5");
		const t2 = Date.now();
		interaction.reply(`Calculating ping... ${config.emojis.loading}`).then((i) => {
			i.edit(`Discord: \`${Math.round(Date.now() - t1)}ms\`\nDeeeep.io: \`${Math.round(t2 - t1)}ms\``);
		});
	},
};
