const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	PermissionFlagsBits,
} = require("discord.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("About ThresherShark"),
	async execute(/** @type {import("discord.js").Interaction} */ interaction) {
		await interaction.client.application.fetch();
		const perms =
			PermissionFlagsBits.UseExternalEmojis | PermissionFlagsBits.AttachFiles;
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setLabel("Invite to your server")
				.setStyle(ButtonStyle.Link)
				.setURL(
					`https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID || 0}&permissions=${perms}&scope=applications.commands+bot&integration_type=0`
				),
			new ButtonBuilder()
				.setLabel("Add to your apps")
				.setStyle(ButtonStyle.Link)
				.setURL(
					`https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID || 0}&scope=applications.commands&integration_type=1`
				)
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
