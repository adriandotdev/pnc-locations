const { GraphQLError } = require("graphql");
const logger = require("../config/winston");
const Crypto = require("../utils/Crypto");
const AccountRepository = require("../repository/AuthenticationRepository");
const JsonWebToken = require("../utils/JsonWebToken");
const jwt = require("jsonwebtoken");
const {
	HttpUnauthorized,
	HttpInternalServerError,
} = require("../utils/HttpError");
const repository = new AccountRepository();

const AccessTokenVerifier = async (accessToken) => {
	// logger
	logger.info({
		ACCESS_TOKEN_VERIFIER_MIDDLEWARE: {
			access_token: accessToken,
		},
	});

	try {
		if (!accessToken) throw new HttpUnauthorized("Unauthorized", []);

		const decryptedAccessToken = Crypto.Decrypt(accessToken);

		const isAccessTokenExistingInDB = await repository.FindAccessToken(
			decryptedAccessToken
		);

		if (isAccessTokenExistingInDB.length < 1) {
			throw new HttpUnauthorized("Unauthorized", []);
		}

		let data = {};

		JsonWebToken.Verify(
			decryptedAccessToken,
			process.env.JWT_ACCESS_KEY,
			(err, decode) => {
				if (err) {
					if (err instanceof jwt.TokenExpiredError) {
						throw new HttpUnauthorized("Token Expired", []);
					} else if (err instanceof jwt.JsonWebTokenError) {
						throw new HttpUnauthorized("Invalid Token", []);
					} else {
						throw new HttpUnauthorized("Unauthorized", []);
					}
				}

				if (
					decode.iss !== "parkncharge" ||
					decode.typ !== "Bearer" ||
					decode.aud !== "parkncharge-app" ||
					decode.usr !== "serv"
				)
					if (err !== null) {
						throw new HttpUnauthorized("Invalid Token", []);
					}

				data = {
					username: decode.data.username,
					id: decode.data.id,
					role_id: decode.data.role_id,
					access_token: decryptedAccessToken,
				};
			}
		);

		logger.info({
			ACCESS_TOKEN_VERIFIER_MIDDLEWARE: {
				message: "SUCCESS",
			},
		});

		return data;
	} catch (err) {
		logger.error({
			ACCESS_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
				message: err.message,
			},
		});

		if (err !== null) {
			throw new HttpUnauthorized(err.message, []);
		}

		throw new HttpInternalServerError("Internal Server Error", []);
	}
};

module.exports = AccessTokenVerifier;
