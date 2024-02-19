const mysql = require("../database/mysql");

module.exports = class FiltersRepository {
	GetFacilities() {
		return new Promise((resolve, reject) => {
			mysql.query("SELECT * FROM facilities", (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetCapabilities() {
		return new Promise((resolve, reject) => {
			mysql.query("SELECT * FROM capabilities", (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetPaymentTypes() {
		return new Promise((resolve, reject) => {
			mysql.query("SELECT * FROM payment_types", (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetParkingTypes() {
		return new Promise((resolve, reject) => {
			mysql.query("SELECT * FROM parking_types", (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetParkingRestrictions() {
		return new Promise((resolve, reject) => {
			mysql.query("SELECT * FROM parking_restrictions", (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetConnectorTypes() {
		return new Promise((resolve, reject) => {
			mysql.query("SELECT * FROM connector_types", (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetPowerTypes() {
		return new Promise((resolve, reject) => {
			mysql.query("SELECT * FROM power_types", (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
