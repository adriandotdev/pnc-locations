const mysql = require("../database/mysql");

const SP_ADD_MERCHANT_TO_FAVORITES = "CALL SP_ADD_MERCHANT_TO_FAVORITES(?,?)";
const SP_GET_FAVORITE_MERCHANTS = "CALL SP_GET_FAVORITE_MERCHANTS(?,?,?)";

module.exports = class FavoriteMerchantsRepository {
	AddMerchantToFavorites(userID, userMerchantID) {
		return new Promise((resolve, reject) => {
			mysql.query(
				SP_ADD_MERCHANT_TO_FAVORITES,
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

	GetFavoriteMerchants({ user_id, location }) {
		return new Promise((resolve, reject) => {
			mysql.getConnection((err, connection) => {
				if (err) {
					connection.release();
					reject(err);
				}
				connection.query(
					SP_GET_FAVORITE_MERCHANTS,
					[user_id, location.lat, location.lng],
					(err, result) => {
						if (err) {
							reject(err);
						}

						resolve({ result, connection });
					}
				);
			});
		});
	}

	RemoveMerchantsFromFavorites({ user_id, merchant_id }) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"DELETE FROM favorite_merchants WHERE user_id = ? AND user_merchant_id = ?",
				[user_id, merchant_id],
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
