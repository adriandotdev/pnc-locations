require("dotenv").config();
const { GraphQLError } = require("graphql");

const JsonWebToken = require("../utils/JsonWebToken");
const jwt = require("jsonwebtoken");
const logger = require("../config/winston");

module.exports = BasicTokenVerifier = (auth) => {
	logger.info({
		BASIC_TOKEN_VERIFIER_MIDDLEWARE: {
			token: auth,
		},
	});

	try {
		if (!auth)
			throw new GraphQLError("Unauthorized", {
				extensions: { code: "FORBIDDEN" },
			});

		JsonWebToken.Verify(auth, process.env.PARKNCHARGE_SECRET_KEY);

		logger.info({
			BASIC_TOKEN_VERIFIER_MIDDLEWARE: {
				message: "Valid Token",
			},
		});

		return true;
	} catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			logger.error({
				BASIC_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
					message: "Invalid Token",
				},
			});
			throw new GraphQLError("Unauthorized", {
				extensions: { code: "FORBIDDEN" },
			});
		} else if (err instanceof jwt.TokenExpiredError) {
			logger.error({
				BASIC_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
					message: "Token Expired",
				},
			});
			throw new GraphQLError("Unauthorized", {
				extensions: { code: "FORBIDDEN" },
			});
		} else if (err !== null) {
			logger.error({
				BASIC_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
					message: err.message,
				},
			});
			throw new GraphQLError("Unauthorized", {
				extensions: { code: "FORBIDDEN" },
			});
		} else {
			logger.error({
				BASIC_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
					message: "Internal Server Error",
				},
			});

			throw new GraphQLError("Unauthorized", {
				extensions: { code: "FORBIDDEN" },
			});
		}
	}
};
