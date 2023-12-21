const axios = require("axios");

// Repository
const NearbyMerchantsRepository = require("../repository/NearbyMerchantsRepository");

// Config
const config = require("../config/config");
const winston = require("../config/winston");

module.exports = class NearbyMerchantsService {
	constructor() {
		this._repository = new NearbyMerchantsRepository();
	}

	async GetNearbyMerchants(lat, lng) {
		const nearbyMerchants = await this._repository.GetNearbyMerchants(lat, lng);

		const modifiedNearbyMerchants = await Promise.all(
			nearbyMerchants.result.map(async (merchant) => {
				// Get list of stations based on current merchant_id.
				const stations = await this._repository.GetEVChargerTypes(
					merchant.merchant_id,
					nearbyMerchants.connection
				);

				// Get list of amenities based on current merchant_id.
				const amenities = await this._repository.GetAmenities(
					merchant.merchant_id,
					nearbyMerchants.connection
				);

				const addressDetails = await axios.get(
					`https://maps.googleapis.com/maps/api/geocode/json?latlng=${merchant.lat},${merchant.lng}&key=${config.googleAuth.GEO_API_KEY}`
				);

				// Extract the city from address components from Google response.
				const city = addressDetails.data.results[0].address_components.find(
					(addr) =>
						addr.types[0] === "locality" || addr.types[2] === "political"
				);

				// Extract the region from address components from Google response.
				const region = addressDetails.data.results[0].address_components.find(
					(addr) =>
						addr.types[0] === "administrative_area_level_1" ||
						addr.types[2] === "political"
				);

				// Extract the country from the address components from Google response.
				const country = addressDetails.data.results[0].address_components.find(
					(addr) => addr.types[0] === "country" || addr.types[2] === "political"
				);

				return {
					...merchant,
					formatted_address: addressDetails.data.results[0].formatted_address,
					city: city.short_name,
					region: region.short_name,
					country: country.long_name,
					country_code: country.short_name,
					stations,
					amenities,
				};
			})
		);

		nearbyMerchants.connection.release();

		return modifiedNearbyMerchants;
	}
};
