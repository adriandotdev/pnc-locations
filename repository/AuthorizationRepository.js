const mysql = require("../database/mysql");

module.exports = class AuthorizationRepository {
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
};
