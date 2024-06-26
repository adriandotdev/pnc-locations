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

	GetConnectorTypes(connectorID) {
		const query = `SELECT ct.id, ct.code, ct.description
		FROM evse_connectors AS evc
		INNER JOIN evse_connector_types AS evct
		ON evc.connector_id = evct.connector_id
		INNER JOIN connector_types AS ct
		ON evct.connector_type_id = ct.id
		WHERE evct.connector_id = ?`;

		return new Promise((resolve, reject) => {
			mysql.query(query, [connectorID], (err, result) => {
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
				WHERE 
					cpo_owner_id IS NOT NULL
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

	GetLocation(location) {
		const QUERY = `
			SELECT
			*,
			(SELECT (6371 * 2 * ASIN(SQRT(
				POWER(SIN((${location.lat} - ABS(address_lat)) * PI() / 180 / 2), 2) +
				COS(${location.lat} * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
				POWER(SIN((${location.lng} - address_lng) * PI() / 180 / 2), 2)
			)) ) AS distance) AS distance
		FROM
			cpo_locations
		WHERE cpo_locations.id = ?
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [location.id], (err, result) => {
				if (err) {
					reject(err);
				}
				resolve(result[0]);
			});
		});
	}

	GetLocationWithFavorite(location, user_id) {
		const QUERY = `
            SELECT
                *,
                (SELECT (6371 * 2 * ASIN(SQRT(
                    POWER(SIN((${location.lat} - ABS(address_lat)) * PI() / 180 / 2), 2) +
                    COS(${location.lat} * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
                    POWER(SIN((${location.lng} - address_lng) * PI() / 180 / 2), 2)
                    )) ) AS distance) AS distance,
                    
				(CASE WHEN EXISTS (SELECT 1 FROM favorite_merchants WHERE cpo_location_id = cpo_locations.id AND user_id = ?)
					THEN 'true' ELSE 'false' END) AS favorite
        	FROM cpo_locations
			WHERE cpo_locations.id = ?
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [user_id, location.id], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result[0]);
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
                    
				(CASE WHEN EXISTS (SELECT 1 FROM favorite_merchants WHERE cpo_location_id = cpo_locations.id AND user_id = ${user_id})
					THEN 'true' ELSE 'false' END) AS favorite
        FROM cpo_locations
		WHERE cpo_owner_id IS NOT NULL`;

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

	FilterLocations(
		location,
		facilities,
		capabilities,
		payment_types,
		parking_types,
		parking_restrictions,
		connector_types,
		power_types
	) {
		const query = `
			SELECT 
				DISTINCT 
				cpo_locations.*,
				(6371 * 2 * ASIN(SQRT(
					POWER(SIN((? - ABS(address_lat)) * PI() / 180 / 2), 2) +
					COS(? * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
					POWER(SIN((? - address_lng) * PI() / 180 / 2), 2)
				))) AS distance
			FROM 
				cpo_locations
				LEFT JOIN cpo_location_facilities ON cpo_locations.id = cpo_location_facilities.cpo_location_id
				LEFT JOIN facilities ON cpo_location_facilities.facility_id = facilities.id
				LEFT JOIN cpo_location_parking_types ON cpo_locations.id = cpo_location_parking_types.cpo_location_id
				LEFT JOIN parking_types ON cpo_location_parking_types.parking_type_id = parking_types.id
				LEFT JOIN cpo_location_parking_restrictions ON cpo_locations.id = cpo_location_parking_restrictions.cpo_location_id
				LEFT JOIN parking_restrictions ON cpo_location_parking_restrictions.parking_restriction_code_id = parking_restrictions.id
				LEFT JOIN evse ON cpo_locations.id = evse.cpo_location_id
				LEFT JOIN evse_capabilities ON evse.uid = evse_capabilities.evse_uid
				LEFT JOIN capabilities ON evse_capabilities.capability_id = capabilities.id
				LEFT JOIN evse_payment_types ON evse.uid = evse_payment_types.evse_uid
				LEFT JOIN payment_types ON evse_payment_types.payment_type_id = payment_types.id
				LEFT JOIN evse_connectors ON evse.uid = evse_connectors.evse_uid
				LEFT JOIN evse_connector_types ON evse_connectors.connector_id = evse_connector_types.connector_id
				LEFT JOIN connector_types ON evse_connector_types.connector_type_id = connector_types.id
				LEFT JOIN evse_connector_power_types ON evse_connector_power_types.connector_id = evse_connectors.connector_id
				LEFT JOIN power_types ON evse_connector_power_types.power_type_id = power_types.id
			WHERE 
				cpo_locations.cpo_owner_id IS NOT NULL AND
				${facilities === "" ? `1 = 1` : `facilities.code IN (${facilities})`} AND
				${
					payment_types === ""
						? `1 = 1`
						: `payment_types.code IN (${payment_types})`
				} AND 
				${
					parking_types === ""
						? `1 = 1`
						: `cpo_location_parking_types.tag IN (${parking_types})`
				} AND
				${
					parking_restrictions === ""
						? `1 = 1`
						: `parking_restrictions.code IN (${parking_restrictions})`
				} 
				AND ${capabilities === "" ? `1 = 1` : `capabilities.code IN (${capabilities})`} 
				AND ${
					connector_types === ""
						? `1 = 1`
						: `connector_types.code IN (${connector_types})`
				} 
				AND ${power_types === "" ? `1 = 1` : `power_types.code IN (${power_types})`}
			ORDER BY 
				id
		`;

		const params = [location.lat, location.lat, location.lng];

		return new Promise((resolve, reject) => {
			mysql.query(query, params, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	FilterLocationsWithFavorites(
		location,
		facilities,
		capabilities,
		payment_types,
		parking_types,
		parking_restrictions,
		connector_types,
		power_types,
		user_id
	) {
		const query = `
		SELECT 
			DISTINCT 
			cpo_locations.*,
			(6371 * 2 * ASIN(SQRT(
				POWER(SIN((? - ABS(address_lat)) * PI() / 180 / 2), 2) +
				COS(? * PI() / 180) * COS(ABS(address_lat) * PI() / 180) *
				POWER(SIN((? - address_lng) * PI() / 180 / 2), 2)
			))) AS distance,
			(
				CASE WHEN cpo_locations.id IN (SELECT cpo_location_id FROM favorite_merchants)
				AND ${user_id} IN (SELECT user_id FROM favorite_merchants) THEN 'true' ELSE 'false' END
			) AS favorite
		FROM 
			cpo_locations
			LEFT JOIN cpo_location_facilities ON cpo_locations.id = cpo_location_facilities.cpo_location_id
			LEFT JOIN facilities ON cpo_location_facilities.facility_id = facilities.id
			LEFT JOIN cpo_location_parking_types ON cpo_locations.id = cpo_location_parking_types.cpo_location_id
			LEFT JOIN parking_types ON cpo_location_parking_types.parking_type_id = parking_types.id
			LEFT JOIN cpo_location_parking_restrictions ON cpo_locations.id = cpo_location_parking_restrictions.cpo_location_id
			LEFT JOIN parking_restrictions ON cpo_location_parking_restrictions.parking_restriction_code_id = parking_restrictions.id
			LEFT JOIN evse ON cpo_locations.id = evse.cpo_location_id
			LEFT JOIN evse_capabilities ON evse.uid = evse_capabilities.evse_uid
			LEFT JOIN capabilities ON evse_capabilities.capability_id = capabilities.id
			LEFT JOIN evse_payment_types ON evse.uid = evse_payment_types.evse_uid
			LEFT JOIN payment_types ON evse_payment_types.payment_type_id = payment_types.id
			LEFT JOIN evse_connectors ON evse.uid = evse_connectors.evse_uid
			LEFT JOIN evse_connector_types ON evse_connectors.connector_id = evse_connector_types.connector_id
			LEFT JOIN connector_types ON evse_connector_types.connector_type_id = connector_types.id
			LEFT JOIN evse_connector_power_types ON evse_connector_power_types.connector_id = evse_connectors.connector_id
			LEFT JOIN power_types ON evse_connector_power_types.power_type_id = power_types.id
		WHERE 
			cpo_locations.cpo_owner_id IS NOT NULL AND
			${facilities === "" ? `1 = 1` : `facilities.code IN (${facilities})`} AND
			${
				payment_types === ""
					? `1 = 1`
					: `payment_types.code IN (${payment_types})`
			} AND 
			${
				parking_types === ""
					? `1 = 1`
					: `cpo_location_parking_types.tag IN (${parking_types})`
			} AND
			${
				parking_restrictions === ""
					? `1 = 1`
					: `parking_restrictions.code IN (${parking_restrictions})`
			} 
			AND ${capabilities === "" ? `1 = 1` : `capabilities.code IN (${capabilities})`} 
			AND ${
				connector_types === ""
					? `1 = 1`
					: `connector_types.code IN (${connector_types})`
			} 
			AND ${power_types === "" ? `1 = 1` : `power_types.code IN (${power_types})`}
		ORDER BY 
			id
		`;

		const params = [location.lat, location.lat, location.lng];

		return new Promise((resolve, reject) => {
			mysql.query(query, params, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetLocationParkingRestrictions(locationID) {
		const query = `SELECT pr.* FROM cpo_locations AS cl
		INNER JOIN cpo_location_parking_restrictions AS clpr
		ON cl.id = clpr.cpo_location_id
		INNER JOIN parking_restrictions AS pr
		ON clpr.parking_restriction_code_id = pr.id 
		WHERE clpr.cpo_location_id = ?`;

		return new Promise((resolve, reject) => {
			mysql.query(query, [locationID], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetLocationParkingTypes(locationID) {
		const query = `SELECT pt.* FROM cpo_locations AS cl
		INNER JOIN cpo_location_parking_types AS clpt
		ON cl.id = clpt.cpo_location_id
		INNER JOIN parking_types AS pt
		ON clpt.parking_type_id = pt.id
		WHERE clpt.cpo_location_id = ?`;

		return new Promise((resolve, reject) => {
			mysql.query(query, [locationID], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
