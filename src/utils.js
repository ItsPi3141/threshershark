const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { apng2gif } = require("./tools/img");
const config = require("../config.json");

function numberWithCommas(x) {
	return typeof x === "number"
		? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		: "N/A";
}

const socialNetworks = {
	ig: "https://instagram.com/",
	rd: "https://reddit.com/u/",
	tc: "https://twitch.tv/",
	tw: "https://x.com/",
	wb: "https://weibo.com/",
	fb: true,
	vk: true,
	yt: true,
};

async function userProfileEmbed(profileData, statsData, socialNetworksData) {
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

	const embed = new EmbedBuilder()
		.setURL(`https://deeeep.io/u/${profileData.username}`)
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
				: "https://deeeep.io/img/avatar.png",
		)
		.setTimestamp();

	profileData.badges.length > 0 &&
		embed.addFields({
			name: "Badges",
			value: profileData.badges.map((b) => config.emojis[b.slug]).join(" "),
			inline: false,
		});

	if (socialNetworksData.length > 0) {
		let s = socialNetworksData
			.map((n) => {
				if (typeof socialNetworks[n.platform_id] === "string") {
					return `${config.emojis[n.platform_id]} [${n.platform_user_id}](${socialNetworks[n.platform_id] + n.platform_user_id})`;
				}
				if (typeof socialNetworks[n.platform_id] === "boolean") {
					return `${config.emojis[n.platform_id]} [${n.platform_user_id}](${n.platform_user_url})`;
				}
				return `${config.emojis[n.platform_id]} ${n.platform_user_id}`;
			})
			.join("\n");
		while (s.length > 1024) {
			s = s.split("\n").slice(0, -1).join("\n");
		}
		embed.addFields({
			name: "Social networks",
			value: s,
			inline: false,
		});
	}

	return {
		embeds: [embed],
		files: attachments,
	};
}

class FunctionQueue {
	constructor() {
		this.queue = Promise.resolve();
		this._length = 0;
	}

	async enqueue(fn) {
		this._length++;
		const result = this.queue.then(() => fn());
		this.queue = result.finally(() => this._length--);
		return await result;
	}

	get length() {
		return this._length;
	}
}

module.exports = {
	numberWithCommas,
	userProfileEmbed,
	FunctionQueue,
};
