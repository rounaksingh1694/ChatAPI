const express = require("express");
const { sign } = require("jsonwebtoken");
const router = express.Router();
const { check, expressValidator } = require("express-validator");

const { signUp, signIn, signOut } = require("../controllers/auth");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/base");

router.post(
	"/signup",
	[
		check("name", "Name is required").isLength({ min: 1 }),
		check("email", "Email is required").isEmail(),
		check("password", "Password should be atleast 6 characters long").isLength({
			min: 4,
		}),
	],
	signUp
);

router.post(
	"/signin",
	[
		check("email", "Email is required").isEmail(),
		check("password", "Password should be atleast 6 characters long").isLength({
			min: 4,
		}),
	],
	signIn
);

router.get("/signout", isSignedIn, isAuthenticated, signOut);

module.exports = router;
