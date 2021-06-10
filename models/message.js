const mongoose = require("mongoose");
mongoose.set("useFindAndModify", true);
const { Schema } = mongoose;
const { ObjectId } = Schema;

const messageSchema = new Schema(
	{
		from: {
			type: ObjectId,
			ref: "User",
			required: true,
		},
		to: {
			type: ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
			trim: true,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
