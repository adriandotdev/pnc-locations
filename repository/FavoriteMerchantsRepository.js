const mysql = require("../database/mysql");

module.exports = class FavoriteMerchantsRepository {
	AddMerchantToFavorites(userID, userMerchantID) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"INSERT INTO favorite_merchants (user_id, user_merchant_id) VALUES(?,?)",
				[userID, userMerchantID],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	GetFavoriteMerchants() {
		return new Promise((resolve, reject) => {});
	}
};
