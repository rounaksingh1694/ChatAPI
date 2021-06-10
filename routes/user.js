const express = require("express");
const { sign } = require("jsonwebtoken");
const router = express.Router();
const { check, expressValidator } = require("express-validator");

const { getAllUsers, getUser } = require("../controllers/user");
const {
	isSignedIn,
	isAuthenticated,
	isAdmin,
	getUserById,
} = require("../controllers/base");

router.param("userId", getUserById);

router.get("/all/:userId", isSignedIn, isAuthenticated, getAllUsers);
router.get("/:userId", isSignedIn, isAuthenticated, getUser);

module.exports = router;
