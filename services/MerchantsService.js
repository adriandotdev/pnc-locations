const axios = require("axios");

// Repository
const MerchantsRepository = require("../repository/MerchantsRepository");

module.exports = class NearbyMerchantsService {
	constructor() {
		this._repository = new MerchantsRepository();
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
					`https://maps.googleapis.com/maps/api/geocode/json?latlng=${merchant.lat},${merchant.lng}&key=${process.env.GOOGLE_GEO_API_KEY}`
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

	async GetNearbyMerchant(data) {
		const response = await this._repository.GetNearbyMerchant(data);

		if (response.result.length === 0) {
			response.connection.release();
			return 0;
		}

		const stations = await this._repository.GetEVChargerTypes(
			data.merchant_id,
			response.connection
		);

		const amenities = await this._repository.GetAmenities(
			data.merchant_id,
			response.connection
		);

		const addressDetails = await axios.get(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${data.location.lat},${data.location.lng}&key=${process.env.GOOGLE_GEO_API_KEY}`
		);

		// Extract the city from address components from Google response.
		const city = addressDetails.data.results[0].address_components.find(
			(addr) => addr.types[0] === "locality" || addr.types[2] === "political"
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

		response.connection.release();

		return {
			...response.result[0],
			formatted_address: addressDetails.data.results[0].formatted_address,
			city: city.short_name,
			region: region.short_name,
			country: country.long_name,
			country_code: country.short_name,
			stations,
			amenities,
		};
	}
	async GetFilteredMerchants(location, filter) {
		const types = filter.types
			.map((type, index) => {
				if (filter.types.length - 1 === index) {
					return `'${type}'`;
				}

				return `'${type}', `;
			})
			.join("");

		const meter_types = filter.meter_types
			.map((meter_type, index) => {
				if (filter.meter_types.length - 1 === index) {
					return `'${meter_type}'`;
				}

				return `'${meter_type}', `;
			})
			.join("");

		const filteredMerchants = await this._repository.GetFilteredMerchants(
			location,
			{ ...filter, types, meter_types }
		);

		const modifiedNearbyMerchants = await Promise.all(
			filteredMerchants.result.map(async (merchant) => {
				// Get list of stations based on current merchant_id.
				const stations = await this._repository.GetEVChargerTypes(
					merchant.merchant_id,
					filteredMerchants.connection
				);

				// Get list of amenities based on current merchant_id.
				const amenities = await this._repository.GetAmenities(
					merchant.merchant_id,
					filteredMerchants.connection
				);

				const addressDetails = await axios.get(
					`https://maps.googleapis.com/maps/api/geocode/json?latlng=${merchant.lat},${merchant.lng}&key=${process.env.GOOGLE_GEO_API_KEY}`
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

		filteredMerchants.connection.release();

		return modifiedNearbyMerchants;
	}

	async GetNearbyAndFavoriteMerchants({ user_id, lat, lng }) {
		const favoriteMerchants =
			await this._repository.GetNearbyMerchantsWithFavorites({
				user_id,
				lat,
				lng,
			});
		const nearbyMerchants = await this._repository.GetNearbyMerchants(lat, lng);

		let nearbyAndFavoriteMerchants = nearbyMerchants.result.map((nm) => {
			const isFavorite = favoriteMerchants.some(
				(fm) => fm.merchant_id === nm.merchant_id
			);

			if (!isFavorite) return { favorite: false, ...nm };

			return { favorite: true, ...nm };
		});

		const modifiedNearbyMerchants = await Promise.all(
			nearbyAndFavoriteMerchants.map(async (merchant) => {
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
					`https://maps.googleapis.com/maps/api/geocode/json?latlng=${merchant.lat},${merchant.lng}&key=${process.env.GOOGLE_GEO_API_KEY}`
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

	async GetFilteredMerchantsWithFavorites({ user_id, location, filter }) {
		const types = filter.types
			.map((type, index) => {
				if (filter.types.length - 1 === index) {
					return `'${type}'`;
				}

				return `'${type}', `;
			})
			.join("");

		const meter_types = filter.meter_types
			.map((meter_type, index) => {
				if (filter.meter_types.length - 1 === index) {
					return `'${meter_type}'`;
				}

				return `'${meter_type}', `;
			})
			.join("");

		const filteredMerchants = await this._repository.GetFilteredMerchants(
			location,
			{ ...filter, types, meter_types }
		);

		const filteredFavoriteMerchants =
			await this._repository.GetFilteredMerchantsWithFavorites({
				user_id,
				location,
				filter: { ...filter, types, meter_types },
				connection: filteredMerchants.connection,
			});

		let filteredMerchantsWithFavorites = filteredMerchants.result.map((nm) => {
			const isFavorite = filteredFavoriteMerchants.some(
				(fm) => fm.merchant_id === nm.merchant_id
			);

			if (!isFavorite) return { favorite: false, ...nm };

			return { favorite: true, ...nm };
		});

		const modifiedNearbyMerchants = await Promise.all(
			filteredMerchantsWithFavorites.map(async (merchant) => {
				// Get list of stations based on current merchant_id.
				const stations = await this._repository.GetEVChargerTypes(
					merchant.merchant_id,
					filteredMerchants.connection
				);

				// Get list of amenities based on current merchant_id.
				const amenities = await this._repository.GetAmenities(
					merchant.merchant_id,
					filteredMerchants.connection
				);

				const addressDetails = await axios.get(
					`https://maps.googleapis.com/maps/api/geocode/json?latlng=${merchant.lat},${merchant.lng}&key=${process.env.GOOGLE_GEO_API_KEY}`
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

		filteredMerchants.connection.release();

		return modifiedNearbyMerchants;
	}
};
