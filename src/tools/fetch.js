async function getPage(url) {
	return await (await fetch(url)).json();
}
async function getImageB64(url) {
	return `data:image;base64,${Buffer.from(await (await fetch(url)).arrayBuffer()).toString("base64")}`;
}
async function getImageBuffer(url) {
	return Buffer.from(await (await fetch(url)).arrayBuffer());
}

module.exports = {
	getPage,
	getImageB64,
	getImageBuffer,
};
