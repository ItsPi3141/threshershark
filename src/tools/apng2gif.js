const apng = require("sharp-apng");
const fs = require("node:fs");
// const isApng = require("is-apng").default;

async function apng2gif(url) {
	const isApng = (await import("is-apng")).default;

	const image = Buffer.from(await (await fetch(url)).arrayBuffer());
	if (!isApng(image)) return image;

	const animatedImg = await apng.sharpFromApng(image);
	return new Promise((resolve) => {
		animatedImg.toBuffer((err, buffer) => {
			if (err) resolve(null);
			resolve(buffer);
		});
	});
}

module.exports = {
	apng2gif,
};
