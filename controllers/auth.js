const User = require("../models/user");
const {
	check,
	expressValidator,
	validationResult,
} = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

const {
	isSignedIn,
	isAuthenticated,
	getErrorMessageInJson,
	USER_FIELDS_TO_POPULATE,
} = require("../controllers/base");

const generateAccessToken = (userId) => {
	return jwt.sign({ _id: userId }, process.env.SECRET);
};

const authSuccessResponse = (res, user) => {
	const accessToken = generateAccessToken(user._id);
	const authResponse = {
		accessToken: accessToken,
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
			profilePhoto: user.profilePhoto,
			chats: user.chats,
		},
	};
	res.cookie("userData", authResponse, {
		expire: new Date() + 5 * 24 * 60 * 60,
	});
	return res.status(200).json(authResponse);
};

exports.signUp = (req, res) => {
	console.log("BODY", req.body);
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log("ERRORSSS", errors);
		return res.status(401).json({
			error: errors.array()[0].msg,
			parameter: errors.array()[0].param,
		});
	}

	const user = new User(req.body);

	user.save((error, user) => {
		if (error || !user) {
			console.error("ERROR SIGN UP", error);
			return getErrorMessageInJson(res, 400, "This email already exists.");
		}
		return authSuccessResponse(res, user);
	});
};

exports.signIn = (req, res) => {
	const { email, password } = req.body;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log("ERRORSSS", errors);
		return res.status(401).json({
			error: errors.array()[0].msg,
			parameter: errors.array()[0].param,
		});
	}

	User.findOne({ email }, (error, user) => {
		if (error || !user) {
			console.error("ERROR SIGN IN", error);
			return getErrorMessageInJson(res, 400, "User does not exist");
		}

		console.log("PASSWORD", user.password);

		if (!user.authenticate(password)) {
			return getErrorMessageInJson(res, 400, "Email & password don't match");
		}
		return authSuccessResponse(res, user);
	});
};

exports.signOut = (req, res) => {
	res.status(200).json({
		message: "Sign out successfull",
	});
};
