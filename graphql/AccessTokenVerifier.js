const { GraphQLError } = require("graphql");
const logger = require("../config/winston");
const Crypto = require("../utils/Crypto");
const AccountRepository = require("../repository/AuthenticationRepository");
const JsonWebToken = require("../utils/JsonWebToken");
const jwt = require("jsonwebtoken");
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
						throw new GraphQLError("Token Expired", {
							extensions: { code: 401 },
						});
					} else if (err instanceof jwt.JsonWebTokenError) {
						throw new GraphQLError("Invalid Token", {
							extensions: { code: 401 },
						});
					} else {
						throw new GraphQLError("Internal Server Error", {
							extensions: { code: 500 },
						});
					}
				}

				if (
					decode.iss !== "parkncharge" ||
					decode.typ !== "Bearer" ||
					decode.aud !== "parkncharge-app" ||
					decode.usr !== "serv"
				)
					if (err !== null) {
						throw new GraphQLError("Unauthorized", {
							extensions: { code: 401 },
						});
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
			throw new GraphQLError("Unauthorized", {
				extensions: { code: 401 },
			});
		}

		throw new GraphQLError("INTERNAL_SERVER_ERROR", {
			extensions: { code: 401 },
		});
	}
};

module.exports = AccessTokenVerifier;
