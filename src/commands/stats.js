const { SlashCommandBuilder } = require("discord.js");
const { getPage } = require("../tools/fetch.js");
const { getConnectedAccount } = require("../tools/mongo.js");
const { userProfileEmbed } = require("../utils.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Display a user's Deeeep.io profile")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("Display someone else's profile")
				.setRequired(false),
		),
	async execute(/** @type {import("discord.js").Interaction} */ interaction) {
		await interaction.client.application.fetch();

		const id = await getConnectedAccount(
			interaction.options.getUser("user")?.id || interaction.user.id,
		);
		if (!id) {
			return await interaction.reply({
				content: `${config.emojis.false} ${interaction.options.getUser("user")?.id ? "This user is" : "You are"} not connected to a Deeeep.io account!`,
			});
		}

		await interaction.reply({
			content: `${config.emojis.loading} Fetching data...`,
		});

		const profileUrl = `https://api.deeeep.io/users/${id}?ref=profile`;
		const profileData = await getPage(profileUrl);
		if (profileData === null) {
			throw new Error("Cloudflare error!");
		}

		const statsUrl = `https://api.deeeep.io/userStats/${profileData.id}`;
		const statsData = await getPage(statsUrl);
		if (statsData === null) {
			throw new Error("Cloudflare error!");
		}

		const socialNetworksUrl = `https://api.deeeep.io/socialNetworks/u/${profileData.id}`;
		const socialNetworksData = await getPage(socialNetworksUrl);
		if (socialNetworksData === null) {
			throw new Error("Cloudflare error!");
		}

		const embedData = await userProfileEmbed(
			profileData,
			statsData,
			socialNetworksData,
		);
		await interaction.editReply({
			content: "",
			embeds: embedData.embeds,
			files: embedData.files,
		});
	},
};
