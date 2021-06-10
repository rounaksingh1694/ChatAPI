const mongoose = require("mongoose");
mongoose.set("useFindAndModify", true);
const { Schema } = mongoose;
const { ObjectId } = Schema;
const crypto = require("crypto");
const { v1: uuidv1 } = require("uuid");

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		encryptedPassword: {
			type: String,
		},
		salt: {
			type: String,
		},
		profilePhoto: {
			type: String,
		},
		chats: [
			{
				chat: {
					type: ObjectId,
					ref: "Chat",
				},
				with: {
					type: ObjectId,
					ref: "User",
				},
			},
		],
	},
	{ timestamps: true }
);

userSchema
	.virtual("password")
	.set(function (password) {
		console.log("PASSOWRD", password);
		this._password = password;
		this.salt = uuidv1();
		console.log("SALT", this.salt);
		this.encryptedPassword = this.encrypt(password);
		console.log("ENCRYPTED PASSWORD", this.encryptedPassword);
	})
	.get(function () {
		return this._password;
	});

userSchema.methods = {
	authenticate: function (password) {
		return this.encrypt(password) == this.encryptedPassword;
	},

	encrypt: function (password) {
		if (!password) return "";
		try {
			return crypto
				.createHmac("sha256", this.salt)
				.update(password)
				.digest("hex");
		} catch (e) {
			console.error("ERROR IN CREATING PASSOWRD", e);
		}
	},
};

module.exports = mongoose.model("User", userSchema);
