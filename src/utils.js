const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { apng2gif } = require("./tools/apng2gif");
const config = require("../config.json");

function numberWithCommas(x) {
	return typeof x === "number"
		? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		: "N/A";
}

async function userProfileEmbed(profileData, statsData) {
	const hasPfp = !!profileData.picture;
	let gifData = null;
	let isApng = false;
	if (hasPfp) {
		const a2g = await apng2gif(
			`https://cdn.deeeep.io/uploads/avatars/${profileData.picture}`,
		);
		if (a2g === null) {
			isApng = false;
		} else {
			isApng = true;
			gifData = a2g;
		}
	}

	const attachments = [];
	if (isApng) {
		attachments.push(
			new AttachmentBuilder(gifData, {
				name: "pfp.gif",
			}),
		);
	}

	return {
		embeds: [
			new EmbedBuilder()
				.setURL(`https://beta.deeeep.io/u/${profileData.username}`)
				.setTitle(
					`${profileData.username} ${profileData.verified ? config.emojis.verified : ""}`,
				)
				.setDescription(profileData.about?.toString() || "*No description*")
				.addFields(
					{
						name: "Kills",
						value: `${numberWithCommas(profileData.kill_count)} (#${numberWithCommas(statsData.rank_kc)})`,
						inline: true,
					},
					{
						name: "Play count",
						value: `${numberWithCommas(profileData.play_count)} (#${numberWithCommas(statsData.rank_pc)})`,
						inline: true,
					},
					{
						name: "KDR",
						value: `${
							(profileData.play_count === 0
								? profileData.kill_count
								: profileData.kill_count / profileData.play_count
							).toFixed(2) || "*N/A*"
						}`,
						inline: true,
					},
					{
						name: "High score",
						value: `${numberWithCommas(profileData.highest_score)} (#${numberWithCommas(statsData.rank_hs)})`,
						inline: true,
					},
					{
						name: "Pearl defense",
						value:
							statsData.pd === null
								? "*No data*"
								: `${numberWithCommas(statsData.pd.played)} played, ${numberWithCommas(statsData.pd.won)} won; win ratio: ${
										statsData.pd.ratio
									}%`,
						inline: false,
					},
					{
						name: "Coins",
						value: numberWithCommas(profileData.coins),
						inline: true,
					},
					{
						name: "XP",
						value: `${numberWithCommas(profileData.xp)} (Tier ${profileData.tier || 1})`,
						inline: true,
					},
					{
						name: "Profile views",
						value: numberWithCommas(profileData.profile_views),
						inline: true,
					},
					{
						name: "Date created",
						value: `<t:${Math.round(Date.parse(profileData.date_created) / 1000)}:F>`,
						inline: true,
					},
					{
						name: "Date last played",
						value: `<t:${Math.round(Date.parse(profileData.date_last_played) / 1000)}:F>`,
						inline: true,
					},
					{
						name: "Death message",
						value: profileData.description?.toString() || "*No death message*",
						inline: false,
					},
				)
				.setFooter({
					text: `ID: ${profileData.id}`,
				})
				.setImage(
					profileData.picture
						? isApng
							? "attachment://pfp.gif"
							: `https://cdn.deeeep.io/uploads/avatars/${profileData.picture}`
						: "https://beta.deeeep.io/img/avatar.png",
				)
				.setTimestamp(),
		],
		files: attachments,
	};
}

module.exports = {
	numberWithCommas,
	userProfileEmbed,
};
