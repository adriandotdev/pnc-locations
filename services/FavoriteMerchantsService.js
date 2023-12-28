const FavoriteMerchantsRepository = require("../repository/FavoriteMerchantsRepository");

module.exports = class FavoriteMerchantsService {
	constructor() {
		this._repository = new FavoriteMerchantsRepository();
	}

	async AddMerchantToFavorites(userID, userMerchantID) {
		const response = await this._repository.AddMerchantToFavorites(
			userID,
			userMerchantID
		);

		return response;
	}
};
