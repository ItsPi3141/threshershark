const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ButtonBuilder,
} = require("discord.js");
const { getPage } = require("../tools/fetch.js");
const { userProfileEmbed } = require("../utils.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("hackstats")
		.setDescription("Find a Deeeep.io profile by username or ID")
		.addStringOption((option) =>
			option
				.setName("mode")
				.setDescription("Search by username or user ID")
				.setRequired(true)
				.setChoices(
					{
						name: "Username",
						value: "username",
					},
					{
						name: "User ID",
						value: "userid",
					},
				),
		)
		.addStringOption((option) =>
			option
				.setName("user")
				.setDescription("The user to display")
				.setRequired(true),
		),
	async execute(/** @type {import("discord.js").Interaction} */ interaction) {
		await interaction.client.application.fetch();

		const profileUrl =
			interaction.options.getString("mode") === "username"
				? `https://api.deeeep.io/users/u/${interaction.options.getString("user")}?ref=profile`
				: `https://api.deeeep.io/users/${interaction.options.getString("user")}?ref=profile`;
		const profileData = await getPage(profileUrl);
		if (profileData === null) {
			throw new Error("Cloudflare error!");
		}
		if (!profileData.id) {
			return await interaction.reply(
				`⚠️ Account not found! Make sure you have inputted a valid ${interaction.options.getString("mode") === "username" ? "username" : "user ID"}.`,
			);
		}

		const statsUrl = `https://api.deeeep.io/userStats/${profileData.id}`;
		const statsData = await getPage(statsUrl);
		if (statsData === null) {
			throw new Error("Cloudflare error!");
		}

		const embedData = await userProfileEmbed(profileData, statsData);
		await interaction.reply({
			embeds: embedData.embeds,
			files: embedData.files,
		});
	},
};
