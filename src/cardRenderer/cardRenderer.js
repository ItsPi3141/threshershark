const nodeHtmlToImage = require("node-html-to-image");
const font2base64 = require("node-font2base64");
const fs = require("node:fs");
const path = require("node:path");
const { numberWithCommas } = require("../utils");
const animals = require("../../animals.json");

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

const resources = {
	quicksandFont400: font2base64.encodeToDataUrlSync(path.join(__dirname, "Quicksand400.ttf")),
	quicksandFont500: font2base64.encodeToDataUrlSync(path.join(__dirname, "Quicksand500.ttf")),
};

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
	const image = await nodeHtmlToImage({
		html: fs.readFileSync(path.join(__dirname, "profile", "profile.html"), "utf8"),
		transparent: true,
		type: "png",
		puppeteerArgs: {
			headless: true,
		},
		content: {
			quicksandFont400: resources.quicksandFont400,
			quicksandFont500: resources.quicksandFont500,
			background: hasBgImage ? `url(${backgrounds[theme]})` : "#19212c",
			surfaceColor: hasBgImage ? "#0006" : "#1f2937",
			surfaceAltColor: hasBgImage ? "#0003" : "#19212c",

			profilePicture:
				profileData.picture !== null ? `https://cdn.deeeep.io/uploads/avatars/${profileData.picture}` : "https://beta.deeeep.io/img/avatar.png",
			userId: profileData.id,
			profileViews: numberWithCommas(profileData.profile_views),
			username: profileData.username,
			killCount: numberWithCommas(profileData.kill_count),
			killRank: numberWithCommas(statsData.rank_kc),
			highscore: numberWithCommas(profileData.highest_score),
			highscoreRank: numberWithCommas(statsData.rank_hs),
			playCount: numberWithCommas(profileData.play_count),
			playRank: numberWithCommas(statsData.rank_pc),
			kdRatio: (profileData.play_count === 0 ? profileData.kill_count : profileData.kill_count / profileData.play_count).toFixed(2),
			pdWonPlayed: hasPd ? `${numberWithCommas(statsData.pd.won)}/${numberWithCommas(statsData.pd.played)} won` : "No data",
			pdPercent: hasPd ? `(${statsData.pd.ratio}%)` : "",
			xp: numberWithCommas(profileData.xp),
			xpColor: tierColors[profileData.tier],
			xpPercent: `${
				profileData.tier === 10
					? 100
					: Math.round(((profileData.xp - tierXpReq[profileData.tier]) / (tierXpReq[profileData.tier + 1] - tierXpReq[profileData.tier])) * 100)
			}%`,
			tier: profileData.tier || 1,
		},
	});
	return image;
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
	const image = await nodeHtmlToImage({
		html: fs.readFileSync(path.join(__dirname, "skin", "skin.html"), "utf8"),
		transparent: true,
		type: "png",
		puppeteerArgs: {
			headless: true,
		},
		content: {
			quicksandFont400: resources.quicksandFont400,
			quicksandFont500: resources.quicksandFont500,

			name: skinData.name,
			animal: animals[skinData.fish_level] || "Unknown",
			animalImage: `https://beta.deeeep.io/assets/characters/${animals[skinData.fish_level]}.png`,
			skin: `https://cdn.deeeep.io/custom/skins/${skinData.asset}?v=${skinData.version}`,
			user: skinData.user.username,
			description: skinData.description || "*No description*",
			price: `${numberWithCommas(skinData.price)} ${skinData.price === 1 ? "coin" : "coins"}`,
			showStats: skinData.attributes === null ? "none" : "flex",
			showHabChangeNotice: skinData.attributes?.includes("HA=") ? "flex" : "none",
			stats:
				skinData.attributes === null
					? ""
					: skinData.attributes
							.split(";")
							.map((attr) => {
								const [key, value] = attr.split("=");
								if (skinAttributes[key]) {
									return `<span>${skinAttributes[key].title}: ${value}${skinAttributes[key].symbol}</span>`;
								}
								return "";
							})
							.join(""),
		},
	});
	return image;
}

module.exports = {
	createProfileCard,
	createSkinCard,
};
