const express = require("express");
const router = express.Router();

const {
	isSignedIn,
	isAuthenticated,
	isAdmin,
	getUserById,
} = require("../controllers/base");
const { sendMessage, sync, getLastMessage } = require("../controllers/chat");

router.param("userId", getUserById);

router.post("/send/message/:userId", isSignedIn, isAuthenticated, sendMessage);

router.post(
	"/last/message/:userId",
	isSignedIn,
	isAuthenticated,
	getLastMessage
);

router.post("/sync/:userId", isSignedIn, isAuthenticated, sync);

module.exports = router;
