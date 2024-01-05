const mysql = require("../database/mysql");

module.exports = class MerchantsRepository {
	/**
	 * A method that retrieves all of nearby merchants based on
	 * user's location by providing the latitude, and longtitude.
	 *
	 * @param {*} lat
	 * - The latitude of location.
	 * @param {*} lng
	 * - The longtitude of location.
	 * @returns
	 * - List of merchants.
	 *
	 * @NOTE: The query is using Haversine Formula.
	 */
	GetNearbyMerchants(lat, lng) {
		return new Promise((resolve, reject) => {
			mysql.getConnection((err, connection) => {
				if (err) {
					connection.release();
					reject(err);
				}

				mysql.query(
					`SELECT
                user_merchants.id AS merchant_id,
                merchant_name AS merchant,
                building_name,
                address_lat AS lat,
                address_lng AS lng,
                ROUND(6371 * 2 * ASIN(SQRT(
                  POWER(SIN((${lat} - ABS(address_lat)) * PI() / 180 / 2), 2) +
                  COS(${lat} * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
                  POWER(SIN((${lng} - address_lng) * PI() / 180 / 2), 2)
                )), 1) AS distance
              FROM
                user_merchants
              HAVING
                distance < 1000
              ORDER BY
                distance`,

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

	/**
	 * Reason why there are still lat, and lng because we need how far the merchant from the user's location.
	 */
	GetFilteredMerchants(location, filter) {
		return new Promise((resolve, reject) => {
			mysql.getConnection((err, connection) => {
				if (err) {
					connection.release();
					reject(err);
				}

				mysql.query(
					`SELECT
					DISTINCT (user_merchants.id) AS merchant_id,
					merchant_name AS merchant,
					building_name,
					address_lat AS lat,
					address_lng AS lng,
					ROUND(6371 * 2 * ASIN(SQRT(
					  POWER(SIN((${location.lat} - ABS(address_lat)) * PI() / 180 / 2), 2) +
					  COS(${location.lat} * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
					  POWER(SIN((${location.lng} - address_lng) * PI() / 180 / 2), 2)
					)), 1) AS distance
					FROM
					user_merchants
					INNER JOIN ev_chargers
					ON user_merchants.id = ev_chargers.user_merchant_id
					WHERE region = '${filter.region}' AND city = '${filter.city}' AND type IN (${filter.types}) AND meter_type IN (${filter.meter_types})`,
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

	/**
	 * A method to retrieve all the chargers/charger types.
	 * @param {*} merchant_id
	 * - Merchant ID where the charger belongs to.
	 * @param {*} connection
	 * - Connection object to be reused during the query.
	 * @returns
	 * - List of chargers/charger types
	 */
	GetEVChargerTypes(merchant_id, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`SELECT DISTINCT(evc.id) AS ev_charger_id, evc.status AS ev_charger_status, evc.type AS plug_type, evc.model, evc.vendor, evc.serial_number, evc.box_serial_number, evc.firmware_version, evc.meter_type AS charger_type, setting.kwh AS power 
                FROM ev_chargers AS evc 
                INNER JOIN ev_charger_timeslots AS evct
                ON evc.id = evct.ev_charger_id
                INNER JOIN settings_timeslots AS setting
                ON evct.settings_timeslot_id = setting.id
                WHERE user_merchant_id = ?`,
				[merchant_id],
				(err, result) => {
					if (err) {
						reject(err);
					}
					resolve(result);
				}
			);
		});
	}

	/**
	 * A method to retrieve all merchant's amenities.
	 * @param {*} merchant_id
	 * - Merchant ID where the amenities belong to.
	 * @param {*} connection
	 * - Connection object to be reused during the query.
	 * @returns
	 * - List of amenities.
	 */
	GetAmenities(merchant_id, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`SELECT id, user_merchant_id, name FROM user_merchant_amenities WHERE user_merchant_id = ?`,
				[merchant_id],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	GetNearbyMerchantsWithFavorites({ user_id, lat, lng }) {
		return new Promise((resolve, reject) => {
			mysql.query(
				`
			SELECT
			favorite_merchants.user_merchant_id AS 'favorite',
			user_merchants.id AS merchant_id,
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
			LEFT JOIN favorite_merchants
			ON user_merchants.id = favorite_merchants.user_merchant_id
			WHERE favorite_merchants.user_id = ?
			HAVING
			distance < 1000
			ORDER BY
			distance`,
				[lat, lat, lng, user_id],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	GetFilteredMerchantsWithFavorites({ user_id, location, filter, connection }) {
		return new Promise((resolve, reject) => {
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
					LEFT JOIN favorite_merchants
					ON user_merchants.id = favorite_merchants.user_merchant_id
					INNER JOIN ev_chargers
					ON favorite_merchants.user_merchant_id = ev_chargers.user_merchant_id
					WHERE region = ? AND city = ? AND TYPE IN (${filter.types}) AND meter_type IN (${filter.meter_types}) 
					AND favorite_merchants.user_id = ?`,
				[
					location.lat,
					location.lat,
					location.lng,
					filter.region,
					filter.city,
					user_id,
				],
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
