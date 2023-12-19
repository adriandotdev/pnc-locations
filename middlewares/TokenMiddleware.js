const jwt = require("jsonwebtoken");
const JsonWebToken = require("../utils/JsonWebToken");
const config = require("../config/config");
const { HttpUnauthorized } = require("../utils/HttpError");
const winston = require("../config/winston");

const AccessTokenVerifier = (req, res, next) => {
	winston.info("Access Token Verifier Middleware");

	try {
		const accessToken = req.headers["authorization"]?.split(" ")[1];

		if (!accessToken) throw new HttpUnauthorized("Unauthorized", []);

		JsonWebToken.Verify(accessToken, config.jwt.accessTokenSecretKey);

		const result = JsonWebToken.Decode(accessToken);

		req.username = result.data.username;
		req.id = result.data.id;
		req.role_id = result.data.role_id;
		req.access_token = accessToken;

		winston.info("Access Token Verifier Middleware: SUCCESS");
		next();
	} catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			winston.error("Access Token Verifier Middleware Error: Invalid Token");
			return res
				.status(401)
				.json({ status: 401, data: [], message: "Invalid Token" });
		} else if (err instanceof jwt.TokenExpiredError) {
			winston.error("Access Token Verifier Middleware Error: Token Expired");
			return res
				.status(401)
				.json({ status: 401, data: [], message: "Token Expired" });
		} else if (err !== null) {
			winston.error(`Access Token Verifier Middleware Error: ${err.message}`);
			return res
				.status(err.status)
				.json({ status: err.status, data: [], message: err.message });
		} else {
			winston.error(
				"Access Token Verifier Middleware Error: Internal Server Error"
			);
			return res
				.status(500)
				.json({ status: 500, data: [], message: "Internal Server Error" });
		}
	}
};

const RefreshTokenVerifier = (req, res, next) => {
	winston.info("Refresh Token Verifier Middleware");

	try {
		const refreshToken = req.headers["authorization"]?.split(" ")[1];

		if (!refreshToken) throw new HttpUnauthorized("Unauthorized", []);

		JsonWebToken.Verify(refreshToken, config.jwt.refreshTokenSecretKey);

		const result = JsonWebToken.Decode(refreshToken);

		req.username = result.data.username;
		req.id = result.data.id;
		req.role_id = result.data.role_id;
		req.refresh_token = refreshToken;

		winston.info("Refresh Token Verifier Middleware Response: SUCCESS");
		next();
	} catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			winston.error("Refresh Token Verifier Error: Invalid Token");
			return res
				.status(401)
				.json({ status: 401, data: [], message: "Invalid Token" });
		} else if (err instanceof jwt.TokenExpiredError) {
			winston.error("Refresh Token Verifier Error: Token Expired");
			return res
				.status(401)
				.json({ status: 401, data: [], message: "Token Expired" });
		} else if (err !== null) {
			winston.error(`Refresh Token Verifier Error: ${err.message}`);
			return res
				.status(err.status)
				.json({ status: err.status, data: [], message: err.message });
		} else {
			winston.error("Refresh Token Verifier Error: Internal Server Error");
			return res
				.status(500)
				.json({ status: 500, data: [], message: "Internal Server Error" });
		}
	}
};

const BasicTokenVerifier = (req, res, next) => {
	winston.info("Basic Token Verifier Middleware");
	try {
		const token = req.headers["authorization"]?.split(" ")[1];

		if (!token) throw new HttpUnauthorized("Unauthorized", []);

		JsonWebToken.Verify(token, config.parkncharge.secretKey);

		winston.info("Basic Token Verifier Middleware Response: SUCCESS");
		next();
	} catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			winston.error("Basic Token Verifier Middleware Error: Invalid Token");
			return res
				.status(401)
				.json({ status: 401, data: [], message: "Invalid Token" });
		} else if (err instanceof jwt.TokenExpiredError) {
			winston.error("Basic Token Verifier Middleware Error: Token Expired");
			return res
				.status(401)
				.json({ status: 401, data: [], message: "Token Expired" });
		} else if (err !== null) {
			winston.error(`Basic Token Verifier Middleware Error: ${err.message}`);
			return res
				.status(err.status)
				.json({ status: err.status, data: [], message: err.message });
		} else {
			winston.error(
				"Basic Token Verifier Middleware Error: Internal Server Error"
			);
			return res
				.status(500)
				.json({ status: 500, data: [], message: "Internal Server Error" });
		}
	}
};

module.exports = {
	AccessTokenVerifier,
	RefreshTokenVerifier,
	BasicTokenVerifier,
};
