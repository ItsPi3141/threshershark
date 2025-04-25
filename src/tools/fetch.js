async function getPage(url) {
	return await (await fetch(url)).json();
}
async function getImageB64(url) {
	return `data:image;base64,${Buffer.from(await (await fetch(url)).arrayBuffer()).toString("base64")}`;
}

module.exports = {
	getPage,
	getImageB64,
};
