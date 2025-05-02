const sharp = require("sharp");
const fs = require("fs");

const terrainColorById = {
	1: "#321e14",
	2: "#26170f",
	3: "#373230",
	4: "#2a2624",
	5: "#0e0e0e",
	6: "#ecdc9a",
	7: "#265696",
	8: "#4b3529",
	9: "#ffffff",
	10: "#e4d493",
	11: "#e4d493",
	12: "#b9c7c2",
	13: "#dfdbd6",
	14: "#da7546",
	15: "#caa56c",
	16: "#98a4a8",
	17: "#45403b",
	18: "#88c6ff",
	19: "#14161c",
};

async function createMapPreview(data) {
	const skies = data.screenObjects.filter((o) => o.type === "Sky");
	const waters = data.screenObjects.filter((o) => o.type === "Wat");
	const bgTerrains = data.screenObjects.filter((o) => o.type === "Bg");
	const terrains = data.screenObjects.filter((o) => o.type === "Ter");

	let defs = "<defs>";
	let paths = "";
	let idCounter = 0;
	for (const sky of skies) {
		if (sky.colors[0] === sky.colors[1]) {
			paths += `<path d="${sky.points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${p.x} ${p.y}`)).join(" ")}" fill="#${sky.colors[0].toString(16).padStart(6, "0")}" />`;
		} else {
			paths += `<path d="${sky.points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${p.x} ${p.y}`)).join(" ")}" fill="url(#g${idCounter})" />`;
			defs += `<linearGradient id="g${idCounter}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#${sky.colors[0].toString(16).padStart(6, "0")}" /><stop offset="100%" stop-color="#${sky.colors[1].toString(16).padStart(6, "0")}" /></linearGradient>`;
			idCounter++;
		}
	}
	for (const water of waters) {
		if (water.colors[0] === water.colors[1]) {
			paths += `<path d="${water.points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${p.x} ${p.y}`)).join(" ")}" fill="#${water.colors[0].toString(16).padStart(6, "0")}" />`;
		} else {
			paths += `<path d="${water.points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${p.x} ${p.y}`)).join(" ")}" fill="url(#g${idCounter})" />`;
			defs += `<linearGradient id="g${idCounter}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#${water.colors[0].toString(16).padStart(6, "0")}" /><stop offset="100%" stop-color="#${water.colors[1].toString(16).padStart(6, "0")}" /></linearGradient>`;
			idCounter++;
		}

		if (!water.hasBorder) continue;
		const points = water.points;
		if (!isClockwise(points)) points.reverse();

		const borderColor = makeBrighter(water.colors[0], 1.75);
		for (let i = 0; i < points.length; i++) {
			const current = points[i];
			const last = points[i > 0 ? i - 1 : points.length - 1];

			if (current.x > last.x && current.x - last.x > 10) {
				paths += `<path d="M ${last.x} ${last.y - 1.5} ${last.x} ${last.y + 1.5} ${current.x} ${current.y + 1.5} ${current.x} ${current.y - 1.5}" fill="${borderColor}" />`;
			}
		}
	}
	for (const bgTerrain of bgTerrains) {
		paths += `<path d="${bgTerrain.points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${p.x} ${p.y}`)).join(" ")}" fill="${terrainColorById[bgTerrain.texture]}" opacity="${bgTerrain.opacity}" />`;
	}
	for (const terrain of terrains) {
		paths += `<path d="${terrain.points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${p.x} ${p.y}`)).join(" ")}" fill="${terrainColorById[terrain.texture]}" />`;
	}
	defs += "</defs>";
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${data.worldSize.width * 10}" height="${data.worldSize.height * 10}">${defs}${paths}</svg>`;

	return await sharp(Buffer.from(svg))
		.resize({ width: 2560, height: 1280, fit: "inside" })
		.png()
		.toBuffer();
}

function makeBrighter(color, brightnessFactor) {
	const hexString = `00000${(0 | color).toString(16)}`.slice(-6);
	const r = Number.parseInt(hexString.slice(0, 2), 16);
	const o = Number.parseInt(hexString.slice(2, 4), 16);
	const l = Number.parseInt(hexString.slice(4, 6), 16);
	let c = brightnessFactor;

	if (r * brightnessFactor > 280) {
		const a = 280 / r;
		if (a < c) {
			c = a;
		}
	}

	if (o * brightnessFactor > 280) {
		const a = 280 / o;
		if (a < c) {
			c = a;
		}
	}

	if (l * brightnessFactor > 280) {
		const a = 280 / l;
		if (a < c) {
			c = a;
		}
	}

	const newR = r * c;
	const newO = o * c;
	const newL = l * c;
	const [red, green, blue] = redistributeRgb(newR, newO, newL);

	return `#${`0${Math.floor(red).toString(16)}`.slice(-2)}${`0${Math.floor(green).toString(16)}`.slice(-2)}${`0${Math.floor(
		blue,
	).toString(16)}`.slice(-2)}`;
}
function redistributeRgb(red, green, blue) {
	const maxColorValue = 255.999;
	const maxColor = Math.max(red, green, blue);

	if (maxColor <= maxColorValue) {
		return [red, green, blue];
	}

	const sum = red + green + blue;

	if (sum >= 3 * maxColorValue) {
		return [maxColorValue, maxColorValue, maxColorValue];
	}

	const ratio = (3 * maxColorValue - sum) / (3 * maxColor - sum);
	const offset = maxColorValue - ratio * maxColor;

	return [offset + ratio * red, offset + ratio * green, offset + ratio * blue];
}
function isClockwise(points) {
	let total = 0;
	for (let i = 0; i < points.length; i++) {
		// Get the current and next point
		const currentPoint = points[i];
		const nextPoint = points[(i + 1) % points.length];

		// Calculate the cross product of the points
		total += (nextPoint.x - currentPoint.x) * (nextPoint.y + currentPoint.y);
	}
	return total < 0;
}

module.exports = {
	createMapPreview,
};
