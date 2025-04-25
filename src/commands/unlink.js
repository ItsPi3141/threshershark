const { SlashCommandBuilder } = require("discord.js");
const { disconnectAccount } = require("../tools/mongo.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unlink")
		.setDescription("Unlink your Deeeep.io account"),
	async execute(/** @type {import("discord.js").Interaction} */ interaction) {
		await interaction.client.application.fetch();

		await disconnectAccount(interaction.user.id);
		return await interaction.reply("✅ Your account has now been unlinked!");
	},
};
