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

	GetConnectors(evseUID) {
		const query = `SELECT * FROM evse_connectors WHERE evse_uid = ?`;

		return new Promise((resolve, reject) => {
			mysql.query(query, [evseUID], (err, result) => {
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

	GetLocationFacilities(locationID) {
		const query = `
		SELECT *
			FROM facilities
			WHERE id IN (
			SELECT facility_id FROM cpo_location_facilities WHERE cpo_location_id = ?
		)`;

		return new Promise((resolve, reject) => {
			mysql.query(query, [locationID], (err, result) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			});
		});
	}

	GetEVSEPaymentTypes(evseUID) {
		const query = `
			SELECT *
				FROM payment_types
				WHERE id IN (
					SELECT payment_type_id FROM evse_payment_types WHERE evse_uid = ?
				)
		`;

		return new Promise((resolve, reject) => {
			mysql.query(query, [evseUID], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetEVSECapabilities(evseUID) {
		const query = `
			SELECT *
			FROM capabilities
			WHERE id IN (
				SELECT capability_id FROM evse_capabilities WHERE evse_uid = ?
			)
		`;

		return new Promise((resolve, reject) => {
			mysql.query(query, evseUID, (err, result) => {
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

	FilterLocations(location, facilities, capabilities, payment_types) {
		const query = `SELECT *,
			(SELECT (6371 * 2 * ASIN(SQRT(
				POWER(SIN((${location.lat} - ABS(address_lat)) * PI() / 180 / 2), 2) +
				COS(${location.lat} * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
				POWER(SIN((${location.lng} - address_lng) * PI() / 180 / 2), 2)
				)))) AS distance
		FROM cpo_locations
		INNER JOIN cpo_location_facilities
		ON cpo_locations.id = cpo_location_facilities.cpo_location_id
		INNER JOIN facilities
		ON cpo_location_facilities.facility_id = facilities.id
		INNER JOIN evse 
		ON cpo_locations.id = evse.cpo_location_id
		INNER JOIN evse_capabilities
		ON evse.uid = evse_capabilities.evse_uid
		INNER JOIN capabilities
		ON evse_capabilities.capability_id = capabilities.id
		INNER JOIN evse_payment_types
		ON evse.uid = evse_payment_types.evse_uid
		INNER JOIN payment_types
		ON evse_payment_types.payment_type_id = payment_types.id
		WHERE facilities.code IN (${facilities})
		AND capabilities.code IN (${capabilities})
		AND payment_types.code IN (${payment_types})`;

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
