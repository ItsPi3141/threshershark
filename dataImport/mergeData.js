const fs = require("node:fs");

const db = JSON.parse(fs.readFileSync("./dataImport/raw/linksDb.json"));
const dirty = JSON.parse(fs.readFileSync("./dataImport/raw/linksDirty.json"));
const mains = JSON.parse(fs.readFileSync("./dataImport/raw/linksMains.json"));

const master = [];

let idCounter = 0;
for (const item of db) {
	master.push({
		id: idCounter++,
		user_id: item.user_id,
		acc_id: item.acc_id,
	});
}
for (const item of mains) {
	const existing = master.findIndex((x) => x.user_id === item.user_id);
	if (existing > -1) {
		master[existing].acc_id = item.acc_id;
	} else {
		master.push({
			id: idCounter++,
			user_id: item.user_id,
			acc_id: item.acc_id,
		});
	}
}
for (const item of dirty) {
	const existing = master.findIndex((x) => x.user_id === item.user_id);
	if (existing > -1) {
		master[existing].acc_id = item.acc_id;
	} else {
		master.push({
			id: idCounter++,
			user_id: item.user_id,
			acc_id: item.acc_id,
		});
	}
}

fs.writeFileSync(
	"./dataImport/linksMaster.json",
	JSON.stringify(master, null, 2).replaceAll("  ", "\t")
);

console.log("Done");
