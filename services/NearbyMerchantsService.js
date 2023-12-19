const NearbyMerchantsRepository = require("../repository/NearbyMerchantsRepository");

module.exports = class NearbyMerchantsService {
	constructor() {
		this._repository = new NearbyMerchantsRepository();
	}

	async GetNearbyMerchants(lat, lng) {
		const nearbyMerchants = await this._repository.GetNearbyMerchants(lat, lng);

		const modifiedNearbyMerchants = await Promise.all(
			nearbyMerchants.result.map(async (merchant) => {
				const stations = await this._repository.GetEVChargerTypes(
					merchant.merchant_id,
					nearbyMerchants.connection
				);

				return {
					...merchant,
					stations,
				};
			})
		);

		nearbyMerchants.connection.release();

		return modifiedNearbyMerchants;
	}
};
