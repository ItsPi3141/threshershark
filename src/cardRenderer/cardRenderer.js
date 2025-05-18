const fs = require("node:fs");
const path = require("node:path");
const { numberWithCommas } = require("../utils");
const { getImageBuffer } = require("../tools/fetch");
const sharp = require("sharp");
const { toStaticPng, bufferToB64 } = require("../tools/img");

const TextToSVG = require("text-to-svg");
const quicksandRegular = TextToSVG.loadSync(
	"./src/cardRenderer/Quicksand400.ttf",
);
const quicksandBold = TextToSVG.loadSync("./src/cardRenderer/Quicksand700.ttf");

function svgText(text, x, y, fontSize, bold = false, align = "center") {
	const font = bold ? quicksandBold : quicksandRegular;
	return font.getD(text, { anchor: `${align} baseline`, fontSize, x, y });
}

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
    preserveAspectRatio="xMidYMid slice" /><rect x="0" y="0" width="900" height="300" rx="32" fill="#19212caa" />`
			: `<rect x="0" y="0" width="900" height="300" rx="32" fill="#19212c" />`,
		surfaceColor: hasBgImage ? "#0006" : "#1f2937",
		surfaceAltColor: hasBgImage ? "#0003" : "#19212c",

		profilePicture: await bufferToB64(
			await toStaticPng(
				await getImageBuffer(
					profileData.picture !== null
						? `https://cdn.deeeep.io/uploads/avatars/${profileData.picture}`
						: "https://deeeep.io/img/avatar.png",
				),
			),
		),

		text_coinCount: `<path d="${svgText(`${numberWithCommas(profileData.coins)} coins`, 112, 215, 20, true)}" fill="#f0c423" />`,

		text_userId: `<path d="${svgText(`ID: ${profileData.id}`, 112, 240, 18)}" fill="#fff" />`,
		text_profileViews: `<path d="${svgText(`${numberWithCommas(profileData.profile_views)} views`, 112, 265, 20)}" fill="#fff" />`,
		text_username: `<path d="${svgText(profileData.username, 437, 70, 32, true)}" fill="${tierColors[profileData.tier]}" />`,

		text_kills: `<path d="${svgText("Kills", 260, 120, 24, true)}" fill="#fff" />`,
		text_killCount: `<path d="${svgText(numberWithCommas(profileData.kill_count), 260, 150, 20)}" fill="#fff" />`,
		text_killRank: `<path d="${svgText(`(#${numberWithCommas(statsData.rank_kc)})`, 260, 175, 18)}" fill="#fff" />`,

		text_highscore: `<path d="${svgText("Highscore", 405, 120, 24, true)}" fill="#fff" />`,
		text_highscoreNumber: `<path d="${svgText(numberWithCommas(profileData.highest_score), 405, 150, 20)}" fill="#fff" />`,
		text_highscoreRank: `<path d="${svgText(`(#${numberWithCommas(statsData.rank_hs)})`, 405, 175, 18)}" fill="#fff" />`,

		text_playCount: `<path d="${svgText("Play count", 565, 120, 24, true)}" fill="#fff" />`,
		text_playCountNumber: `<path d="${svgText(numberWithCommas(profileData.play_count), 565, 150, 20)}" fill="#fff" />`,
		text_playCountRank: `<path d="${svgText(`(#${numberWithCommas(statsData.rank_pc)})`, 565, 175, 18)}" fill="#fff" />`,

		text_kdRatio: `<path d="${svgText("K/D Ratio", 785, 80, 24, true)}" fill="#fff" />`,
		text_kdRatioValue: `<path d="${svgText(
			(profileData.play_count === 0
				? profileData.kill_count
				: profileData.kill_count / profileData.play_count
			).toFixed(2),
			785,
			110,
			20,
		)}" fill="#fff" />`,

		text_pd: `<path d="${svgText("PD", 785, 200, 24, true)}" fill="#fff" />`,
		text_pdWonPlayed: `<path d="${svgText(
			hasPd
				? `${numberWithCommas(statsData.pd.won)}/${numberWithCommas(statsData.pd.played)} won`
				: "No data",
			785,
			228,
			20,
		)}" fill="#fff" />`,
		text_pdPercent: hasPd
			? `<path d="${svgText(
					`(${statsData.pd.ratio}%)`,
					785,
					250,
					18,
				)}" fill="#fff" />`
			: "",

		text_xp: `<path d="${svgText(`${numberWithCommas(profileData.xp)} XP (Tier ${profileData.tier || 1})`, 437, 240, 18, true)}" fill="#fff" />`,

		xpColor: tierColors[profileData.tier],
		xpPercent: Math.max(
			(profileData.tier === 10
				? 1
				: Math.min(
						(profileData.xp - tierXpReq[profileData.tier]) /
							(tierXpReq[profileData.tier + 1] - tierXpReq[profileData.tier]),
						1,
					)) * 420,
			10,
		),
	};
	for (const key in content) {
		svg = svg.replaceAll(`{{${key}}}`, content[key]);
	}

	return await svgToPng(svg);
}

module.exports = {
	createProfileCard,
};
