const mysql = require("../database/mysql");

module.exports = class LocationsRepository {
	GetCPOOwners() {
		return new Promise((resolve, reject) => {
			mysql.query("SELECT * FROM cpo_owners", (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetEVSE(cpoLocationID) {
		return new Promise((resolve, reject) => {
			mysql.query(
				"SELECT * FROM evse WHERE cpo_location_id = ?",
				[cpoLocationID],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	GetLocations(location) {
		const query = `
                SELECT
                    *,
                    (SELECT (6371 * 2 * ASIN(SQRT(
                        POWER(SIN((${location.lat} - ABS(address_lat)) * PI() / 180 / 2), 2) +
                        COS(${location.lat} * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
                        POWER(SIN((${location.lng} - address_lng) * PI() / 180 / 2), 2)
                    )) ) AS distance) AS distance
                FROM
                    cpo_locations
                `;

		return new Promise((resolve, reject) => {
			mysql.query(query, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetLocationsWithFavorites(location, user_id) {
		const query = `
            SELECT
                *,
                (SELECT (6371 * 2 * ASIN(SQRT(
                    POWER(SIN((${location.lat} - ABS(address_lat)) * PI() / 180 / 2), 2) +
                    COS(${location.lat} * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
                    POWER(SIN((${location.lng} - address_lng) * PI() / 180 / 2), 2)
                    )) ) AS distance) AS distance,
                    
                (CASE WHEN id IN (SELECT cpo_location_id FROM favorite_merchants) AND ${user_id} IN (SELECT user_id FROM favorite_merchants)
                THEN 'true' ELSE 'false' end ) AS favorite
        FROM cpo_locations`;

		return new Promise((resolve, reject) => {
			mysql.query(query, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetFavoriteLocations(location, user_id) {
		const query = `
			SELECT *,
			(SELECT (6371 * 2 * ASIN(SQRT(
				POWER(SIN((${location.lat} - ABS(address_lat)) * PI() / 180 / 2), 2) +
				COS(${location.lat} * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
				POWER(SIN((${location.lng} - address_lng) * PI() / 180 / 2), 2)
				)))) AS distance,
				"true" AS favorite
			FROM cpo_locations
			WHERE id IN (SELECT cpo_location_id FROM favorite_merchants WHERE user_id = ${user_id})`;

		return new Promise((resolve, reject) => {
			mysql.query(query, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
