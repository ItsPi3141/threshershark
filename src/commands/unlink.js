const { SlashCommandBuilder } = require("discord.js");
const { disconnectAccount } = require("../tools/mongo.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unlink")
		.setDescription("Unlink your Deeeep.io account"),
	async execute(/** @type {import("discord.js").Interaction} */ interaction) {
		await interaction.client.application.fetch();

		await disconnectAccount(interaction.user.id);
		return await interaction.reply(
			`${config.emojis.true} Your account has now been unlinked!`,
		);
	},
};
