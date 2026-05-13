const mongoose = require("mongoose");
const links = require("./linksMaster.json");

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_ADDRESS}/?retryWrites=true&w=majority`;

const UserDataSchema = new mongoose.Schema({
	discordId: String,
	deeeepioId: String,
});
const UserData = mongoose.model("UserData", UserDataSchema);

async function importAccounts() {
	await mongoose.connect(uri);
	console.log("Connected to DB");

	let counter = 0;
	for (const link of links) {
		const existing = await UserData.findOne({
			discordId: String(link.user_id),
		});
		if (!existing) {
			await UserData.create({
				discordId: String(link.user_id),
				deeeepioId: String(link.acc_id),
			});
			console.log(`Created: ${link.user_id} -> ${link.acc_id}`);
			counter++;
		}
	}

	console.log(`Imported ${counter} accounts`);
	await mongoose.disconnect();
	console.log("Done");
}

importAccounts().catch((err) => {
	console.error(err);
	process.exit(1);
});
