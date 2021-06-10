const User = require("../models/user");

const {
	isSignedIn,
	isAuthenticated,
	getErrorMessageInJson,
	USER_FIELDS_TO_POPULATE,
	sendResponse,
} = require("../controllers/base");
const { result } = require("lodash");

exports.getAllUsers = (req, res) => {
	User.find().exec((error, users) => {
		if (error) {
			return getErrorMessageInJson(res, 400, "Cannot get all users");
		}
		if (!users) {
			return getErrorMessageInJson(res, 400, "No user present");
		}

		const result = users.map((user) => ({
			_id: user._id,
			name: user.name,
			email: user.email,
			profilePhoto: user.profilePhoto,
		}));

		sendResponse(res, { users: result });
	});
};

exports.getUser = (req, res) => {
	const user = req.profile;
	const result = {
		_id: user._id,
		name: user.name,
		email: user.email,
		profilePhoto: user.profilePhoto,
	};
	sendResponse(res, { user: result });
};
