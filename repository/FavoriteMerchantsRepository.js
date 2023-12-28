const mysql = require("../database/mysql");

module.exports = class FavoriteMerchantsRepository {
	AddMerchantToFavorites(userID, userMerchantID) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"CALL SP_ADD_MERCHANT_TO_FAVORITES(?,?)",
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
					`SELECT 
				DISTINCT (user_merchants.id) AS merchant_id,
				merchant_name AS merchant,
				building_name,
				address_lat AS lat,
				address_lng AS lng,
				ROUND(6371 * 2 * ASIN(SQRT(
				  POWER(SIN((? - ABS(address_lat)) * PI() / 180 / 2), 2) +
				  COS(? * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
				  POWER(SIN((? - address_lng) * PI() / 180 / 2), 2)
				)), 1) AS distance
				FROM
				user_merchants
				INNER JOIN favorite_merchants
				ON user_merchants.id = favorite_merchants.user_merchant_id
				WHERE favorite_merchants.user_id = ?`,
					[location.lat, location.lat, location.lng, user_id],
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
};
