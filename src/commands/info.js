const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require("discord.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("About ThresherShark"),
	async execute(/** @type {import("discord.js").Interaction} */ interaction) {
		await interaction.client.application.fetch();
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setLabel("Invite to your server!")
				.setStyle(ButtonStyle.Link)
				.setURL(
					`https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID || 0}&permissions=0&scope=applications.commands+bot`,
				),
		);
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("ThresherShark")
					.setDescription("The new Deeeep.io Stats bot")
					.setFooter({
						text: `Made by ${interaction.client.application.owner.username}`,
					}),
			],
			components: [row],
		});
	},
};
