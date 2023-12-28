const FavoriteMerchantsService = require("../services/FavoriteMerchantsService");

// Config
const winston = require("../config/winston");

// Middleware
const { AccessTokenVerifier } = require("../middlewares/TokenMiddleware");

const { validationResult, param } = require("express-validator");

// Utilities
const { HttpUnprocessableEntity } = require("../utils/HttpError");

module.exports = (app) => {
	const service = new FavoriteMerchantsService();

	/**
	 * This function will be used by the express-validator for input validation,
	 * and to be attached to APIs middleware.
	 * @param {*} req
	 * @param {*} res
	 */
	function validate(req, res) {
		const ERRORS = validationResult(req);

		if (!ERRORS.isEmpty()) {
			throw new HttpUnprocessableEntity(
				"Unprocessable Entity",
				ERRORS.mapped()
			);
		}
	}

	app.post(
		"/api/v1/merchants/favorites/:user_merchant_id",

		[AccessTokenVerifier],
		async (req, res) => {
			winston.info({
				FAVORITE_MERCHANT_REQUEST: {
					user_id: req.id,
					user_merchant_id: req.params.user_merchant_id,
				},
			});
			try {
				const { user_merchant_id } = req.params;

				if (user_merchant_id === null || user_merchant_id === undefined) {
					winston.error({ ERROR: "Missing user_merchant_id" });
					throw new HttpUnprocessableEntity(
						"Please provide a user_merchant_id",
						[]
					);
				}
				await service.AddMerchantToFavorites(+req.id, user_merchant_id);

				winston.info({
					FAVORITE_MERCHANT_RESPONSE: {
						message: "SUCCESS",
						user_id: req.id,
						user_merchant_id,
					},
				});

				return res.status(200).json({ status: 200, data: [] });
			} catch (err) {
				if (err !== null) {
					winston.error({ FAVORITE_MERCHANT_ERROR: err });
					winston.error(err.data);
					return res
						.status(err.status)
						.json({ status: err.status, data: err.data, message: err.message });
				}

				winston.error({ NEARBY_MERCHANTS_ERROR: "Internal Server Error" });
				return res.status(500).json({ status: 500, data: [] });
			}
		}
	);

	app.get(
		"/api/v1/merchants/favorites",
		[AccessTokenVerifier],
		async (req, res) => {
			const { lat, lng, user_id } = req.body;

			const response = await service.GetFavoriteMerchants({
				user_id,
				location: { lat, lng },
			});

			return res.json(response);
		}
	);
};
