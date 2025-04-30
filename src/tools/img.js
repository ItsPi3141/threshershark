const apng = require("sharp-apng");
const fs = require("node:fs");
const sharp = require("sharp");
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

async function toStaticPng(urlOrBuffer) {
	let image;
	if (typeof urlOrBuffer === "string")
		image = Buffer.from(await (await fetch(urlOrBuffer)).arrayBuffer());
	else image = urlOrBuffer;
	return await sharp(image).png().toBuffer();
}

async function bufferToB64(buffer) {
	return `data:image;base64,${buffer.toString("base64")}`;
}

module.exports = {
	apng2gif,
	toStaticPng,
	bufferToB64,
};
