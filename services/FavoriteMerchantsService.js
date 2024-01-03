// Repositories
const FavoriteMerchantsRepository = require("../repository/FavoriteMerchantsRepository");
const MerchantsRepository = require("../repository/MerchantsRepository");

// Misc
const axios = require("axios");

// Configuration File.
const config = require("../config/config");

// Utilities
const { HttpNotFound } = require("../utils/HttpError");

module.exports = class FavoriteMerchantsService {
	constructor() {
		this._favoriteMerchantsRepository = new FavoriteMerchantsRepository();

		/**
		 * We added the MerchantsRepository because there are methods that
		 * we still need.
		 */
		this._merchantsRepository = new MerchantsRepository();
	}

	/**
	 * @description
	 * - This method is for adding merchant to user's favorites.
	 * @param {*} userID
	 * - id of the logged in user.
	 * @param {*} userMerchantID
	 * - id of the liked/added merchant.
	 * @returns
	 * - status if the merchant is successfully added.
	 */
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

	/**
	 * @description
	 * - This method is to retrieve all favorite merchants of users.
	 * @param {*} object
	 * - object that contains two properties:
	 *  - user_id - id of the logged in user.
	 *  - location - object that consists of lat, and lng of the location.
	 * @returns
	 */
	async GetFavoriteMerchants({ user_id, location }) {
		const favoriteMerchants =
			await this._favoriteMerchantsRepository.GetFavoriteMerchants({
				user_id,
				location,
			});

		const status = favoriteMerchants.result[1][0].STATUS;

		if (status === "USER_ID_NOT_FOUND") return new HttpNotFound(status, []);

		const modifiedFavoriteMerchants = await Promise.all(
			favoriteMerchants.result[0].map(async (merchant) => {
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

		return modifiedFavoriteMerchants;
	}

	async RemoveMerchantsFromFavorites({ user_id, merchant_id }) {
		await this._favoriteMerchantsRepository.RemoveMerchantsFromFavorites({
			user_id,
			merchant_id,
		});
	}
};
