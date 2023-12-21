const NearbyMerchantsRepository = require("../repository/NearbyMerchantsRepository");

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

				return {
					...merchant,
					formatted_address: addressDetails.data.results[0].formatted_address,
					stations,
					amenities,
				};
			})
		);

		nearbyMerchants.connection.release();

		return modifiedNearbyMerchants;
	}
};
