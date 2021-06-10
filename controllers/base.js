const {
	check,
	expressValidator,
	validationResult,
} = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const User = require("../models/user");

// Custom Middlewares
exports.isSignedIn = expressJwt({
	secret: process.env.SECRET,
	requestProperty: "auth",
	algorithms: ["HS256"],
});

exports.isAuthenticated = (req, res, next) => {
	let isAuthenticated =
		req.profile && req.auth && req.profile._id == req.auth._id;
	if (!isAuthenticated) {
		return this.getErrorMessageInJson(res, 400, "Access denied");
	}
	next();
};

exports.isAdmin = (req, res, next) => {
	let isAdmin = req.profile.role === 1;
	if (!isAdmin) {
		return this.getErrorMessageInJson(res, 400, "Access denied NOT an ADMIN");
	}
	next();
};

exports.getErrorMessageInJson = (res, statusCode, errorMessage) => {
	return res.status(statusCode).json({ error: errorMessage });
};

exports.sendResponse = (res, json) => {
	return res.status(200).json(json);
};

// Params
exports.getUserById = (req, res, next, userId) => {
	User.findById(userId).exec((error, user) => {
		if (error || !user) {
			return this.getErrorMessageInJson(res, 400, "User does not exist");
		}
		console.log("USERBY ID", user);
		req.profile = user;
		next();
	});
};
// Constant variables
exports.USER_FIELDS_TO_POPULATE = "_id email name profilePhoto";
