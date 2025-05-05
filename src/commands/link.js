const { SlashCommandBuilder } = require("discord.js");
const { getPage } = require("../tools/fetch.js");
const { connectAccount } = require("../tools/mongo.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("link")
		.setDescription("Connect to a Deeeep.io account")
		.addStringOption((option) =>
			option
				.setName("username")
				.setDescription("Your Deeeep.io username")
				.setRequired(true),
		),
	async execute(/** @type {import("discord.js").Interaction} */ interaction) {
		await interaction.client.application.fetch();

		await interaction.reply({
			content: `${config.emojis.loading} Finding your account...`,
		});

		const profileUrl = `https://api.deeeep.io/users/u/${interaction.options.getString("username")}?ref=profile`;
		const profileData = await getPage(profileUrl);
		if (profileData === null) {
			throw new Error("Cloudflare error!");
		}
		if (!profileData.id) {
			await interaction.editReply(
				`${config.emojis.false} Failed to link your account! Make sure you have inputted a valid username.`,
			);
			return;
		}

		const socialLinksUrl = `https://api.deeeep.io/socialNetworks/u/${profileData.id}`;
		const socialLinksData = await getPage(socialLinksUrl);
		if (socialLinksData === null) {
			throw new Error("Cloudflare error!");
		}

		let isValid = false;
		for (const link of socialLinksData) {
			if (
				link.platform_id === "dc" &&
				link.platform_user_id.toLowerCase() ===
					interaction.user.tag.toLowerCase()
			) {
				isValid = true;
			}
		}

		if (!isValid) {
			await interaction.editReply(
				`${config.emojis.false} Failed to link your account! Make sure your Discord username is added as a social link on your Deeeep.io profile.`,
			);
			return;
		}

		await connectAccount(interaction.user.id, profileData.id);
		return await interaction.editReply(
			`${config.emojis.true} You're now linked to ${profileData.username}!`,
		);
	},
};
