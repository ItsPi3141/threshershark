const fs = require("node:fs");
const path = require("node:path");
const { numberWithCommas } = require("../utils");
const animals = require("../../animals.json");
const { getImageB64 } = require("../tools/fetch");
const sharp = require("sharp");

const tierColors = {
	1: "#fdbe62",
	2: "#ff5959",
	3: "#fc8ab4",
	4: "#ffabab",
	5: "#ffffff",
	6: "#fdaffd",
	7: "#f7931e",
	8: "#e47918",
	9: "#dbdbdb",
	// 10: "#902a2a",
	10: "#ad3b3b",
};
const tierXpReq = {
	1: 0,
	2: 25000,
	3: 75000,
	4: 150000,
	5: 250000,
	6: 375000,
	7: 525000,
	8: 700000,
	9: 900000,
	10: 1125000,
};

async function svgToPng(svg) {
	return await sharp(Buffer.from(svg)).png().toBuffer();
}

function b64Background(name) {
	const image = fs.readFileSync(path.join(__dirname, "backgrounds", name));
	return `data:image/png;base64,${image.toString("base64")}`;
}
const backgrounds = {
	cold: b64Background("cold.png"),
	deep: b64Background("deep.png"),
	deepfresh: b64Background("deepfresh.png"),
	fresh: b64Background("fresh.png"),
	reef: b64Background("reef.png"),
	terrain: b64Background("terrain.png"),
};

async function createProfileCard(profileData, statsData, theme) {
	const hasPd = statsData.pd !== null;
	const hasBgImage = typeof backgrounds[theme] === "string";

	let svg = fs.readFileSync(
		path.join(__dirname, "profile", "profile.svg"),
		"utf8",
	);
	const content = {
		background: hasBgImage
			? `<image href="${backgrounds[theme]}" x="0" y="0" width="900" height="300" clip-path="url(#bgClip)"
    preserveAspectRatio="xMidYMid slice" />`
			: `<rect x="0" y="0" width="900" height="300" rx="32" fill="#19212c" />`,
		surfaceColor: hasBgImage ? "#0006" : "#1f2937",
		surfaceAltColor: hasBgImage ? "#0003" : "#19212c",

		profilePicture: await getImageB64(
			profileData.picture !== null
				? `https://cdn.deeeep.io/uploads/avatars/${profileData.picture}`
				: "https://deeeep.io/img/avatar.png",
		),
		userId: profileData.id,
		profileViews: numberWithCommas(profileData.profile_views),
		username: profileData.username,
		killCount: numberWithCommas(profileData.kill_count),
		killRank: numberWithCommas(statsData.rank_kc),
		highscore: numberWithCommas(profileData.highest_score),
		highscoreRank: numberWithCommas(statsData.rank_hs),
		playCount: numberWithCommas(profileData.play_count),
		playRank: numberWithCommas(statsData.rank_pc),
		kdRatio: (profileData.play_count === 0
			? profileData.kill_count
			: profileData.kill_count / profileData.play_count
		).toFixed(2),
		pdWonPlayed: hasPd
			? `${numberWithCommas(statsData.pd.won)}/${numberWithCommas(statsData.pd.played)} won`
			: "No data",
		pdPercent: hasPd ? `(${statsData.pd.ratio}%)` : "",
		xp: numberWithCommas(profileData.xp),
		xpColor: tierColors[profileData.tier],
		xpPercent: Math.max(
			(profileData.tier === 10
				? 1
				: Math.min(
						Math.round(
							(profileData.xp - tierXpReq[profileData.tier]) /
								(tierXpReq[profileData.tier + 1] - tierXpReq[profileData.tier]),
						),
						1,
					)) * 420,
			10,
		),
		tier: profileData.tier || 1,
	};
	for (const key in content) {
		svg = svg.replaceAll(`{{${key}}}`, content[key]);
	}

	return await svgToPng(svg);
}

const skinAttributes = {
	HM: {
		id: "HM",
		title: "Health multiplier",
		symbol: "x",
	},
	DM: {
		id: "DM",
		title: "Damage multiplier",
		symbol: "x",
	},
	DB: {
		id: "DB",
		title: "Damage block",
		symbol: "%",
	},
	DR: {
		id: "DR",
		title: "Damage reflection",
		symbol: "%",
	},
	AP: {
		id: "AP",
		title: "Armor penetration",
		symbol: "%",
	},
	BR: {
		id: "BR",
		title: "Bleeding reduction",
		symbol: "%",
	},
	OT: {
		id: "OT",
		title: "Oxygen time",
		symbol: "s",
	},
	TT: {
		id: "TT",
		title: "Temperature time",
		symbol: "s",
	},
	PT: {
		id: "PT",
		title: "Pressure time",
		symbol: "s",
	},
	ST: {
		id: "ST",
		title: "Salinity time",
		symbol: "s",
	},
	SS: {
		id: "SS",
		title: "Size scale",
		symbol: "x",
	},
};

async function createSkinCard(skinData) {
	let svg = fs.readFileSync(path.join(__dirname, "skin", "skin.svg"), "utf8");
	const content = {
		name: skinData.name,
		animal: animals[skinData.fish_level] || "Unknown",
		animalImage: await getImageB64(
			`https://deeeep.io/assets/characters/${animals[skinData.fish_level]}.png`,
		),
		skin: await getImageB64(
			`https://cdn.deeeep.io/custom/skins/${skinData.asset}?v=${skinData.version}`,
		),
		user: skinData.user.username,
		price: `${numberWithCommas(skinData.price)} ${skinData.price === 1 ? "coin" : "coins"}`,
		showStats: skinData.attributes === null ? "none" : "flex",
		showHabChangeNotice: skinData.attributes?.includes("HA=") ? "flex" : "none",
		stats:
			skinData.attributes === null
				? ""
				: skinData.attributes
						.split(";")
						.filter((attr) => {
							const [key, value] = attr.split("=");
							if (skinAttributes[key]) return true;
							return false;
						})
						.map((attr, index) => {
							const [key, value] = attr.split("=");
							if (skinAttributes[key]) {
								return `<text x="${index % 2 === 0 ? "50" : "425"}" y="${832 + Math.floor(index / 2) * 36}" class="stat">${skinAttributes[key].title}: ${
									value.endsWith(skinAttributes[key].symbol)
										? value
										: `${value}${skinAttributes[key].symbol}`
								}</text>`;
							}
							return "";
						})
						.join(""),
		cardHeight:
			skinData.attributes === null
				? 726
				: 852 +
					Math.ceil(
						skinData.attributes.split(";").filter((attr) => {
							const [key, value] = attr.split("=");
							if (skinAttributes[key]) return true;
							return false;
						}).length / 2,
					) *
						36,
		infoBoxHeight:
			skinData.attributes === null
				? 96
				: 222 +
					Math.ceil(
						skinData.attributes.split(";").filter((attr) => {
							const [key, value] = attr.split("=");
							if (skinAttributes[key]) return true;
							return false;
						}).length / 2,
					) *
						36,
	};
	for (const key in content) {
		svg = svg.replaceAll(`{{${key}}}`, content[key]);
	}

	return await svgToPng(svg);
}

module.exports = {
	createProfileCard,
	createSkinCard,
};
