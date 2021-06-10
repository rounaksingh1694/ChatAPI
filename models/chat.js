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

Chat.watch([], { fullDocument: "updateLookup" }).on("change", (change) => {
	console.log("CHAT CHANGED", change);
	if (change.operationType == "update") {
		const updated = change.updateDescription.updatedFields;
		const fullDoc = change.fullDocument;
		console.log("FULL DIC ID", fullDoc._id);
		Chat.findById(fullDoc._id)
			.populate("messages")
			.exec((error, chat) => {
				if (!error && chat) {
					console.log("FULL DOC", chat);
					pusher.trigger((fullDoc._id + "").trim(), "new", {
						message: chat.messages[chat.messages.length - 1],
						chatId: chat._id,
					});
				} else {
					console.error("ERROR IN OBSERVING", error);
				}
			});
	}
});

module.exports = Chat;
