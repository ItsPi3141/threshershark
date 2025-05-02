const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ButtonBuilder,
	AttachmentBuilder,
} = require("discord.js");
const { getPage } = require("../tools/fetch.js");
const { numberWithCommas } = require("../utils.js");
const { EmbedBuilder } = require("discord.js");
const { createMapPreview } = require("../mapRenderer/mapRenderer.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("map")
		.setDescription("Get info about a Deeeep.io map")
		.addStringOption((option) =>
			option
				.setName("mode")
				.setDescription("Search by string ID or numerical ID")
				.setRequired(true)
				.setChoices(
					{
						name: "Numerical ID",
						value: "nid",
					},
					{
						name: "String ID",
						value: "sid",
					},
				),
		)
		.addStringOption((option) =>
			option
				.setName("map")
				.setDescription("The map to display")
				.setRequired(true),
		),
	async execute(/** @type {import("discord.js").Interaction} */ interaction) {
		await interaction.client.application.fetch();

		interaction.deferReply();

		const mapUrl =
			interaction.options.getString("mode") === "sid"
				? `https://api.deeeep.io/maps/s/${interaction.options.getString("map")}`
				: `https://api.deeeep.io/maps/${interaction.options.getString("map")}`;
		const mapData = await getPage(mapUrl);
		if (mapData === null) {
			throw new Error("Cloudflare error!");
		}
		if (!mapData.id) {
			return await interaction.reply(
				"⚠️ Map not found! Make sure you have inputted a valid ID.",
			);
		}

		const countedObjects = [
			"currents",
			"ceilings",
			"terrains",
			"islands",
			"props",
			"platforms",
			"hide-spaces",
			"air-pockets",
			"background-terrains",
			"water",
			"sky",
			"food-spawns",
		];
		const objectCount = {};
		const totalCount = {
			count: 0,
			points: 0,
		};
		const mapObjectData = JSON.parse(mapData.data);
		for (const object of mapObjectData.screenObjects) {
			if (countedObjects.includes(object.layerId)) {
				if (objectCount[object.layerId] === undefined) {
					objectCount[object.layerId] = {
						count: 1,
						subcount:
							object.layerId === "food-spawns"
								? object.settings.count
								: object.layerId === "hide-spaces" || object.layerId === "props"
									? 1
									: object.points.length,
					};
				} else {
					objectCount[object.layerId].count++;
					objectCount[object.layerId].subcount +=
						object.layerId === "food-spawns"
							? object.settings.count
							: object.layerId === "hide-spaces" || object.layerId === "props"
								? 1
								: object.points.length;
				}
				if (object.layerId !== "food-spawns") {
					totalCount.count++;
					totalCount.points +=
						object.layerId === "hide-spaces" || object.layerId === "props"
							? 1
							: object.points.length;
				}
			}
		}
		const humanReadableObjectCount = Object.entries(objectCount)
			.map(([layer, value]) => {
				return `- **${layer
					.replaceAll("-", " ")
					.match(/(.)(.*)/)
					.slice(1)
					.map((e, i) => (i === 0 ? e.toUpperCase() : e))
					.join(
						"",
					)}**: ${value.count} ${value.count === 1 ? "object" : "objects"} (${value.subcount} ${
					layer === "food-spawns"
						? value.subcount === 1
							? "pellet"
							: "pellets"
						: value.subcount === 1
							? "point"
							: "points"
				})`;
			})
			.join("\n");

		const mapPreviewImg = await createMapPreview(mapObjectData);
		const mapPreviewAttachment = new AttachmentBuilder(mapPreviewImg, {
			name: "map.png",
		});

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: mapData.user.username,
						iconURL: `https://cdn.deeeep.io/uploads/avatars/${mapData.user.picture}`,
					})
					.setURL(`https://mapmaker.deeeep.io/map/${mapData.string_id}`)
					.setTitle(mapData.title)
					.setDescription(mapData.description || "*No description*")
					.addFields(
						{
							name: "Likes",
							value: numberWithCommas(mapData.likes),
							inline: true,
						},
						{
							name: "Locked",
							value: mapData.locked ? "Yes" : "No",
							inline: true,
						},
						{
							name: "Dimensions",
							value: `${numberWithCommas(Number.parseFloat(mapObjectData.worldSize.width))} x ${numberWithCommas(
								Number.parseFloat(mapObjectData.worldSize.height),
							)}`,
							inline: true,
						},
						{
							name: "Gravity",
							value: `${mapObjectData.settings.gravity}`,
							inline: true,
						},
						{
							name: "Date created",
							value: `<t:${Math.round(Date.parse(mapData.created_at) / 1000)}:F>`,
							inline: true,
						},
						{
							name: "Date last updated",
							value: `<t:${Math.round(Date.parse(mapData.updated_at) / 1000)}:F>`,
							inline: true,
						},
						{
							name: "Object count",
							value: `**Total: ${totalCount.count} ${totalCount.count === 1 ? "object" : "objects"} (${totalCount.points} ${
								totalCount.points === 1 ? "point" : "points"
							})**\n${humanReadableObjectCount}`,
							inline: false,
						},
						{
							name: "Tags",
							value:
								mapData.tags.map((t) => `\`${t.id}\``).join(", ") ||
								"*No tags*",
							inline: false,
						},
					)
					.setImage("attachment://map.png")
					.setFooter({
						text: `String ID: ${mapData.string_id} • Numerical ID: ${mapData.id}`,
					})
					.setTimestamp(),
			],
			files: [mapPreviewAttachment],
		});
	},
};
