let _getPage = async (url) => {
	return null;
};

async function getPage(url) {
	return await _getPage(url);
}

(async () => {
	const { connect } = await import("puppeteer-real-browser");
	const { page, browser } = await connect({
		turnstile: true,
		headless: false,
	});
	await page.goto("https://apibeta.deeeep.io", {
		waitUntil: "domcontentloaded",
	});
	_getPage = async (url) => {
		return await page.evaluate(async (u) => {
			try {
				return await (await fetch(u)).json();
			} catch {
				return null;
			}
		}, url);
	};
})();

module.exports = {
	getPage,
};
