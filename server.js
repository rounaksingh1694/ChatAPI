const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const userRoutes = require("./routes/user");

mongoose.connect(
	process.env.DATABASE_HOST,
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

app.use(cors());
app.use(express.json());

const port = process.env.PORT ? process.env.PORT : 8000;

app.listen(port, () => {
	console.log("Server listening on port", port);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
