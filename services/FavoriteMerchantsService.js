const FavoriteMerchantsRepository = require("../repository/FavoriteMerchantsRepository");
const MerchantsRepository = require("../repository/MerchantsRepository");

const axios = require("axios");

const config = require("../config/config");

const { HttpNotFound } = require("../utils/HttpError");

module.exports = class FavoriteMerchantsService {
	constructor() {
		this._favoriteMerchantsRepository = new FavoriteMerchantsRepository();
		this._merchantsRepository = new MerchantsRepository();
	}

	async AddMerchantToFavorites(userID, userMerchantID) {
		const response =
			await this._favoriteMerchantsRepository.AddMerchantToFavorites(
				userID,
				userMerchantID
			);

		const status = response[0][0].STATUS;

		if (status === "USER_MERCHANT_ID_NOT_FOUND")
			throw new HttpNotFound(status, []);

		if (status === "USER_ID_NOT_FOUND") throw new HttpNotFound(status, []);

		if (status === "MERCHANT_EXISTS") throw new HttpNotFound(status, []);

		return response[0][0].STATUS;
	}

	async GetFavoriteMerchants({ user_id, location }) {
		const favoriteMerchants =
			await this._favoriteMerchantsRepository.GetFavoriteMerchants({
				user_id,
				location,
			});

		const modifiedNearbyMerchants = await Promise.all(
			favoriteMerchants.result.map(async (merchant) => {
				// Get list of stations based on current merchant_id.
				const stations = await this._merchantsRepository.GetEVChargerTypes(
					merchant.merchant_id,
					favoriteMerchants.connection
				);

				// Get list of amenities based on current merchant_id.
				const amenities = await this._merchantsRepository.GetAmenities(
					merchant.merchant_id,
					favoriteMerchants.connection
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

		favoriteMerchants.connection.release();

		return modifiedNearbyMerchants;
	}
};
