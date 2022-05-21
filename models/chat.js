const mongoose = require("mongoose");
mongoose.set("useFindAndModify", true);
const { Schema } = mongoose;
const { ObjectId } = Schema;
const Pusher = require("pusher");

const chatSchema = new Schema({
	// first FROM then TO
	between: [
		{
			type: ObjectId,
			ref: "User",
		},
	],
	messages: [
		{
			type: ObjectId,
			ref: "Message",
		},
	],
});

const Chat = mongoose.model("Chat", chatSchema);

const pusher = new Pusher({
	appId: "1216236",
	key: "3f189e635e4d79430b92",
	secret: "8f1cf762e97259e1fcd4",
	cluster: "ap2",
	useTLS: true,
});

module.exports = Chat;
