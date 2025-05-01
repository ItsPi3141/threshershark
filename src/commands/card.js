const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { createProfileCard } = require("../cardRenderer/cardRenderer.js");
const { getConnectedAccount } = require("../tools/mongo.js");
const { getPage } = require("../tools/fetch.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("card")
		.setDescription("Create an image card")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("profile")
				.setDescription("Create a card for a Deeeep.io profile")
				.addStringOption((option) =>
					option
						.setName("mode")
						.setDescription("Search by username or user ID")
						.setRequired(false)
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
						.setRequired(false),
				)
				.addStringOption((option) =>
					option
						.setName("theme")
						.setDescription("The theme of the card")
						.setRequired(false)
						.setChoices([
							{
								name: "Classic",
								value: "classic",
							},
							{
								name: "Arctic",
								value: "cold",
							},
							{
								name: "Deep",
								value: "deep",
							},
							{
								name: "Deep Swamp",
								value: "deepfresh",
							},
							{
								name: "Swamp",
								value: "fresh",
							},
							{
								name: "Reef",
								value: "reef",
							},
							{
								name: "Ground",
								value: "terrain",
							},
						]),
				),
		),
	async execute(
		/** @type {import("discord.js").Interaction} */ interaction,
		/** @type {import("discord.js").Client} */ client,
	) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "profile") {
			let profileData;
			let statsData;

			if (
				interaction.options.getString("mode") ||
				interaction.options.getString("user")
			) {
				if (!interaction.options.getString("user")) {
					return await interaction.reply(
						"⚠️ You must specify a user to search for!",
					);
				}
				if (!interaction.options.getString("mode")) {
					return await interaction.reply("⚠️ You must specify a search mode!");
				}

				const profileUrl =
					interaction.options.getString("mode") === "username"
						? `https://api.deeeep.io/users/u/${interaction.options.getString("user")}?ref=profile`
						: `https://api.deeeep.io/users/${interaction.options.getString("user")}?ref=profile`;
				profileData = await getPage(profileUrl);
				if (profileData === null) {
					throw new Error("Cloudflare error!");
				}
				if (!profileData.id) {
					return await interaction.reply(
						`⚠️ Account not found! Make sure you have inputted a valid ${
							interaction.options.getString("mode") === "username"
								? "username"
								: "user ID"
						}.`,
					);
				}

				const statsUrl = `https://api.deeeep.io/userStats/${profileData.id}`;
				statsData = await getPage(statsUrl);
				if (statsData === null) {
					throw new Error("Cloudflare error!");
				}
			} else {
				const id = await getConnectedAccount(interaction.user.id);
				if (!id) {
					return await interaction.reply({
						content: "You're not connected to a Deeeep.io account!",
					});
				}

				const profileUrl = `https://api.deeeep.io/users/${id}?ref=profile`;
				profileData = await getPage(profileUrl);
				if (profileData === null) {
					throw new Error("Cloudflare error!");
				}

				const statsUrl = `https://api.deeeep.io/userStats/${profileData.id}`;
				statsData = await getPage(statsUrl);
				if (statsData === null) {
					throw new Error("Cloudflare error!");
				}
			}
			await interaction.reply(`${config.emojis.loading} Generating card...`);

			const card = await createProfileCard(
				profileData,
				statsData,
				interaction.options.getString("theme") || "classic",
			);
			return await interaction.editReply({
				content: "",
				files: [
					new AttachmentBuilder(card, {
						name: "card.png",
					}),
				],
			});
		}
	},
};
