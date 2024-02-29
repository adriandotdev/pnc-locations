const mysql = require("../database/mysql");

// Repository is an object that will interact in the database.
module.exports = class AuthenticationRepository {
	VerifyBasicToken(username, password) {
		const query = `call WEB_USER_VERIFY_BASIC_TOKEN(?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(query, [username, password], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	// Login
	Login({ username, password }) {
		return new Promise((resolve, reject) => {
			try {
				mysql.getConnection((err, connection) => {
					if (err) {
						connection.release();
						reject(err);
					}

					connection.query(
						`SELECT id, username, password, role_id FROM users WHERE username = ? AND password = MD5(?)`,
						[username, password],
						(err, result) => {
							if (err) reject(err);

							resolve({ result, connection });
						}
					);
				});
			} catch (err) {
				reject(err);
			}
		});
	}

	FindAccessToken(accessToken) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"SELECT access_token FROM authorization_tokens WHERE access_token = ?",
				[accessToken],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	FindRefreshToken(refreshToken) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"SELECT refresh_token FROM authorization_tokens WHERE refresh_token = ?",
				[refreshToken],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	DeleteRefreshTokenWithUserID(userID) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"DELETE FROM authorization_tokens WHERE user_id = ?",
				[userID],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}
	Logout(userID, accessToken) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"DELETE FROM authorization_tokens WHERE user_id = ? AND access_token = ?",
				[userID, accessToken],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	SaveAuthorizationInfo({ access_token, refresh_token, user_id, connection }) {
		return new Promise((resolve, reject) => {
			try {
				connection.query(
					`INSERT INTO authorization_tokens (user_id, access_token, refresh_token) VALUES(?,?,?)`,
					[user_id, access_token, refresh_token],
					(err, result) => {
						if (err) {
							connection.release();
							reject(err);
						}

						connection.release();
						resolve(result);
					}
				);
			} catch (err) {
				connection.release();
				reject(err);
			}
		});
	}

	UpdateAuthorizationInfo({
		user_id,
		new_access_token,
		new_refresh_token,
		prev_refresh_token,
	}) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"UPDATE authorization_tokens SET access_token = ?, refresh_token = ? WHERE user_id = ? AND refresh_token = ?",
				[new_access_token, new_refresh_token, user_id, prev_refresh_token],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}
	SetAccessToken({ access_token, username, connection }) {
		return new Promise((resolve, reject) => {
			try {
				connection.query(
					"UPDATE users SET access_token = ? WHERE username = ?",
					[access_token, username],
					(err, result) => {
						if (err) {
							connection.release();
							reject(err);
						}

						resolve(result);
					}
				);
			} catch (err) {
				connection.release();
				reject(err);
			}
		});
	}

	SetRefreshToken({ refresh_token, username, connection }) {
		return new Promise((resolve, reject) => {
			try {
				connection.query(
					"UPDATE users SET refresh_token = ? WHERE username = ?",
					[refresh_token, username],
					(err, result) => {
						if (err) {
							connection.release();
							reject(err);
						}

						connection.release();
						resolve(result);
					}
				);
			} catch (err) {
				connection.release();
				reject(err);
			}
		});
	}

	GetAccessToken(username) {
		return new Promise((resolve, reject) => {
			try {
				mysql.getConnection((err, connection) => {
					if (err) {
						connection.release();
						reject(err);
					}

					connection.query(
						"SELECT access_token FROM users WHERE username = ?",
						[username],
						(err, result) => {
							if (err) {
								reject(err);
							}

							resolve({ result, connection });
						}
					);
				});
			} catch (err) {
				reject(err);
			}
		});
	}

	GetRefreshToken(username) {
		return new Promise((resolve, reject) => {
			try {
				mysql.getConnection((err, connection) => {
					if (err) {
						connection.release();
						reject(err);
					}

					connection.query(
						"SELECT refresh_token FROM users WHERE username = ?",
						[username],
						(err, result) => {
							if (err) {
								reject(err);
							}

							resolve({ result, connection });
						}
					);
				});
			} catch (err) {
				reject(err);
			}
		});
	}

	SendOTP({ email, otp, token, token_expiration }) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"call CHECK_OTP_DAY(?,?,?,?)",
				[email, otp, token, token_expiration],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	VerifyOTP({ user_id, otp }) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"call CHECK_INPUT_OTP(?,?)",
				[user_id, otp],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	ChangePassword({ password, user_id }) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"call CHANGE_PASSWORD(?,?)",
				[user_id, password],
				(err, result) => {
					if (err) {
						reject(err);
					}
					resolve(result);
				}
			);
		});
	}
};
