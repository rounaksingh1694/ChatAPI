const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs.json");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const userRoutes = require("./routes/user");
const Chat = require("./models/chat");

mongoose.connect(
	process.env.PROD_DATABASE_HOST,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	},
	() => {
		console.log("SUCCESSFULLY CONNECTED TO DATABASE");
	}
);

// const db = mongoose.connection;

// db.on("error", console.error.bind(console, "connection error:"));

// db.once("open", () => {
// 	console.log("DB CONNECTED");
// 	const chatCollection = db.collection("chats");
// 	console.log("CHAT COLLECTION", chatCollection);
// 	const changeStream = chatCollection.watch();
// 	console.log("CHAT STREAM", changeStream);

// 	changeStream.on("error", (change) => {
// 		console.log("ERROR IN CHAT COLLECTION", change);
// 	});
// 	changeStream.on("change", (change) => {
// 		console.log("CHANGED IN CHAT COLLECTION", change);
// 	});
// });

const app = express();

// app.use(cors());
app.use(express.json());

const port = process.env.PORT ? process.env.PORT : 8000;
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);

const httpServer = require("http").createServer(app);

httpServer.listen(port, () => {
	console.log("Server listening on port", port);
});

const io = require("socket.io")(httpServer, {
	cors: {
		origin: "*",
	},
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
					// pusher.trigger(), "new", {
					// 	message: chat.messages[chat.messages.length - 1],
					// 	chatId: chat._id,
					// });

					// connectionId is chatId
					const connectionId = (fullDoc._id + "").trim();
					const payload = {
						message: chat.messages[chat.messages.length - 1],
						chatId: chat._id,
					};
					console.log("CONNECTION ID", connectionId);
					console.log("PAYLOAD", payload);

					io.emit(connectionId, payload);
				} else {
					console.error("ERROR IN OBSERVING", error);
				}
			});
	}
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = httpServer;
