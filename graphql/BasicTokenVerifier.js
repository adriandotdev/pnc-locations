require("dotenv").config();
const { GraphQLError } = require("graphql");

const logger = require("../config/winston");
const AccountRepository = require("../repository/AccountRepository");

const repository = new AccountRepository();

module.exports = BasicTokenVerifier = async (auth) => {
	logger.info({
		BASIC_TOKEN_VERIFIER_MIDDLEWARE: {
			token: auth,
		},
	});

	try {
		if (!auth) return false;

		const securityType = auth.split(" ")[0];
		const token = auth.split(" ")[1];

		if (securityType !== "Basic") return false;

		const decodedToken = new Buffer.from(token, "base64").toString().split(":");

		const username = decodedToken[0];
		const password = decodedToken[1];

		const result = await repository.VerifyBasicToken(username, password);

		const status = result[0][0].STATUS;

		if (status === "INVALID_BASIC_TOKEN") return false;

		logger.info({
			BASIC_TOKEN_VERIFIER_MIDDLEWARE_SUCCESS: { message: "SUCCESS" },
		});

		return true;
	} catch (err) {
		logger.error({
			BASIC_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
				message: err.message,
			},
		});

		return err;
	}
};
