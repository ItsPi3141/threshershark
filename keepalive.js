const { spawn } = require("node:child_process");
const path = require("node:path");

function start() {
	const p = spawn("node", [path.join(__dirname, "src", "index.js")]);
	p.on("exit", () => {
		start();
	});
	p.stdout.on("data", (data) => {
		console.log(Buffer.from(data).toString("utf8"));
	});
	p.stderr.on("data", (data) => {
		console.log(Buffer.from(data).toString("utf-8"));
	});
}
start();
