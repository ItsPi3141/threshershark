const { SlashCommandBuilder } = require("discord.js");
const { getPage } = require("../tools/fetch.js");
const { numberWithCommas } = require("../utils.js");
const { EmbedBuilder } = require("discord.js");
const animals = require("../../animals.json");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("skin")
		.setDescription("Get info about a Deeeep.io skin")
		.addNumberOption((option) =>
			option.setName("id").setDescription("ID of the skin").setRequired(true),
		)
		.addNumberOption((option) =>
			option
				.setName("version")
				.setDescription("Version of the skin")
				.setRequired(false),
		),
	async execute(/** @type {import("discord.js").Interaction} */ interaction) {
		await interaction.client.application.fetch();

		await interaction.reply(`${config.emojis.loading} Fetching data...`);

		const skinUrl = `https://api.deeeep.io/skins/${interaction.options.getNumber("id")}${
			interaction.options.getNumber("version")
				? `/${interaction.options.getNumber("version")}`
				: ""
		}`;
		const skinData = await getPage(skinUrl);
		if (skinData === null) {
			throw new Error("Cloudflare error!");
		}
		if (!skinData.id) {
			return await interaction.editReply(
				`${config.emojis.false} Skin not found! Make sure you have inputted a valid ID.`,
			);
		}

		const asset = `https://cdn.deeeep.io/custom/skins/${skinData.asset}?v=${skinData.version}`;
		const additionalAssets = [];
		if (skinData.assets_data !== null) {
			for (sprite of Object.values(skinData.assets_data)) {
				additionalAssets.push(
					`https://cdn.deeeep.io/custom/skins/${sprite.asset}?v=${skinData.version}`,
				);
			}
		}
		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setURL(`https://deeeep.io/store/skins/${skinData.id}`)
					.setAuthor({
						name: skinData.user.username || "Unknown",
						iconURL: skinData.user.picture
							? `https://cdn.deeeep.io/uploads/avatars/${skinData.user.picture}`
							: undefined,
					})
					.setTitle(
						`${skinData.name} \`v${numberWithCommas(skinData.version)}\``,
					)
					.setDescription(skinData.description || "*No description*")
					.addFields(
						{
							name: "Animal",
							value: animals[skinData.fish_level] || "Unknown",
							inline: true,
						},
						{
							name: "Category",
							value: `${skinData.category || "Unknown"}${skinData.season ? ` (${skinData.season})` : ""}`,
							inline: true,
						},
						{
							name: "Usable",
							value: `${skinData.usable}`,
							inline: true,
						},
						{
							name: "Price",
							value: `${numberWithCommas(skinData.price)} ${skinData.price === 1 ? "coin" : "coins"}`,
							inline: true,
						},
						{
							name: "Sales",
							value: `${numberWithCommas(skinData.sales)}`,
							inline: true,
						},
						{
							name: "Date created",
							value: `<t:${Math.round(Date.parse(skinData.created_at) / 1000)}:F>`,
							inline: true,
						},
						{
							name: "Date last updated",
							value: `<t:${Math.round(Date.parse(skinData.updated_at) / 1000)}:F>`,
							inline: true,
						},
						{
							name: "Reddit link",
							value: skinData.reddit_link || "*None*",
							inline: false,
						},
						{
							name: "DCC status",
							value: [
								`Approved: ${skinData.approved ? config.emojis.true : config.emojis.false}`,
								`Reviewed: ${skinData.reviewed ? config.emojis.true : config.emojis.false}`,
								`Rejected: ${skinData.rejected ? config.emojis.true : config.emojis.false}`,
							].join("\n"),
							inline: false,
						},
					)
					.setImage(asset)
					.setFooter({
						text: `ID: ${skinData.id}`,
					})
					.setTimestamp(),
				...additionalAssets.map((asset) =>
					new EmbedBuilder()
						.setURL(`https://deeeep.io/store/skins/${skinData.id}`)
						.setImage(asset),
				),
			],
		});
	},
};
