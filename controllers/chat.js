const Chat = require("../models/chat");
const Message = require("../models/message");

const {
	isSignedIn,
	isAuthenticated,
	getErrorMessageInJson,
	USER_FIELDS_TO_POPULATE,
	sendResponse,
} = require("../controllers/base");
const User = require("../models/user");

exports.sendMessage = (req, res) => {
	const message = req.body;

	Chat.findOne({ _id: req.body.chatId }).exec((error, chat) => {
		console.log("FINDING CHAT");
		if (error) {
			console.error("ERROR IN FINDING CHAT", error);
		}
		if (!chat) {
			console.log("NO CHAT NEED TO CREATE ONE");
			Message.create(message, (error, newMessage) => {
				if (error) {
					console.error("ERROR SENDING MESSAGE", error);
					return getErrorMessageInjson(res, 400, "Cannot send message");
				}
				console.log("MESSAGE", newMessage);
				const chat = {
					between: [newMessage.from, newMessage.to],
					messages: [newMessage._id],
				};
				Chat.create(chat, (error, newChat) => {
					if (error) {
						console.error("ERR CREATE CHAT", error);
						return getErrorMessageInJson(res, 400, "Cannot create chat");
					}
					User.findOneAndUpdate(
						{ _id: req.profile._id },
						{
							$push: {
								chats: {
									chat: newChat._id,
									with:
										req.profile._id == req.body.from
											? req.body.to
											: req.body.from,
								},
							},
						},
						{ new: true },
						(err, user) => {
							if (err) {
								return getErrorMessageInJson(res, 400, "Cannot create chat");
							}
							if (!user) {
								return getErrorMessageInJson(
									res,
									400,
									"Cannot create chat for unknown user"
								);
							}
							User.findOneAndUpdate(
								{ _id: req.body.to },
								{
									$push: {
										chats: {
											chat: newChat._id,
											with: req.body.from,
										},
									},
								},
								{ new: true },
								(err, user) => {
									if (err) {
										return getErrorMessageInJson(
											res,
											400,
											"Cannot create chat"
										);
									}
									if (!user) {
										return getErrorMessageInJson(
											res,
											400,
											"Cannot create chat for unknown user"
										);
									}
									newChat
										.populate("messages")
										.execPopulate()
										.then(() => sendResponse(res, newChat));
								}
							);
						}
					);
				});
			});
		} else {
			console.log("CHAT NO NEED TO CREATE ONE", chat);
			Message.create(message, (error, newMessage) => {
				if (error) {
					console.error("ERROR SENDING MESSAGE", error);
					return getErrorMessageInJson(res, 400, "Cannot send message");
				}
				console.log("MESSAGE", newMessage);
				Chat.findOneAndUpdate(
					{ _id: chat._id },
					{
						$push: { messages: newMessage._id },
					},
					{ new: true },
					(error, newChat2) => {
						console.log("NEW CHAT", newChat2);
						if (error) {
							return getErrorMessageInJson(res, 400, "Cannot update chat");
						}
						if (!newChat2) {
							console.log("CANNOT CREATE CHAT");
							return getErrorMessageInJson(res, 400, "Cannot update chat");
						}
						newChat2
							.populate("between", USER_FIELDS_TO_POPULATE)
							.populate("messages", "_id from to message updatedAt")
							.execPopulate()
							.then(() => {
								sendResponse(res, newChat2);
							});
					}
				);
			});
		}
	});
};

exports.sync = (req, res) => {
	console.log("BETWEEN", req.body);
	if (req.body.chatId) {
		Chat.findOne({
			_id: req.body.chatId,
		})
			.populate("messages", "_id from to message updatedAt")
			.exec((error, chat) => {
				if (error) {
					return getErrorMessageInJson(res, 400, "Cannot sync chat");
				}
				if (!chat) {
					return getErrorMessageInJson(res, 400, "No chat");
				}
				console.log("SENDING SYNC RESPONSE");
				sendResponse(res, { chat });
			});
	} else {
		console.log("NO CHAT");
		return getErrorMessageInJson(res, 400, "No chat");
	}
};

exports.getLastMessage = (req, res) => {
	console.log("USER", req.profile);
	if (req.body.chatId) {
		Chat.findOne({
			_id: req.body.chatId,
		})
			.populate("between", USER_FIELDS_TO_POPULATE)
			.populate("messages", "_id from to message updatedAt")
			.exec((error, chat) => {
				if (error) {
					return getErrorMessageInJson(res, 400, "Cannot sync chat");
				}
				if (!chat) {
					return getErrorMessageInJson(res, 400, "No chat");
				}
				console.log("SENDING LAST MESSAGE");
				sendResponse(res, {
					chat: {
						between: chat.between,
						lastMessage: chat.messages[chat.messages.length - 1],
					},
				});
			});
	} else {
		return getErrorMessageInJson(res, 400, "No chat");
	}
};
