const mongoose = require("mongoose");

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_ADDRESS}/?retryWrites=true&w=majority`;
mongoose.connect(uri).then(() => console.log("Connected to DB"));

const UserDataSchema = new mongoose.Schema({
	discordId: String,
	deeeepioId: String,
});
const UserData = mongoose.model("UserData", UserDataSchema);

async function getConnectedAccount(discordId) {
	const res = await UserData.findOne({ discordId: discordId });
	return res?.deeeepioId || null;
}

async function connectAccount(discordId, deeeepioId) {
	const res = await UserData.findOne({ discordId: discordId });
	if (!res) {
		await UserData.create({ discordId: discordId, deeeepioId: deeeepioId });
	} else {
		res.deeeepioId = deeeepioId;
		await res.save();
	}
}

async function disconnectAccount(discordId) {
	await UserData.deleteOne({ discordId: discordId });
}

module.exports = {
	getConnectedAccount,
	connectAccount,
	disconnectAccount,
};
