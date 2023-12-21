const mysql = require("../database/mysql");

module.exports = class NearbyMerchantsRepository {
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

	GetEVChargerTypes(merchant_id, connection) {
		return new Promise((resolve, reject) => {
			connection.query(
				`SELECT DISTINCT(evc.id), evc.status, evc.type AS plug_type, evc.model, evc.vendor, evc.serial_number, evc.box_serial_number, evc.firmware_version, evc.meter_type AS charger_type, setting.kwh AS power 
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
};
