const FavoriteMerchantsService = require("../services/FavoriteMerchantsService");

// Config
const winston = require("../config/winston");

// Middleware
const { AccessTokenVerifier } = require("../middlewares/TokenMiddleware");

const { validationResult, query } = require("express-validator");

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
		"/booking_merchants/api/v1/merchants/favorites/:user_merchant_id",

		[AccessTokenVerifier],
		async (req, res) => {
			winston.info({
				FAVORITE_MERCHANT_API_REQUEST: {
					user_id: req.id,
					user_merchant_id: req.params.user_merchant_id,
				},
			});
			try {
				const { user_merchant_id } = req.params;

				if (user_merchant_id === null || user_merchant_id === undefined) {
					winston.error({
						FAVORITE_MERCHANT_API_ERROR: "Missing user_merchant_id",
					});
					throw new HttpUnprocessableEntity(
						"Please provide a user_merchant_id",
						[]
					);
				}
				await service.AddMerchantToFavorites(+req.id, user_merchant_id);

				winston.info({
					FAVORITE_MERCHANT_API_RESPONSE: {
						message: "SUCCESS",
						user_id: req.id,
						user_merchant_id,
					},
				});

				return res.status(200).json({ status: 200, data: [] });
			} catch (err) {
				if (err !== null) {
					winston.error({ FAVORITE_MERCHANT_API_ERROR: err });
					winston.error(err.data);
					return res
						.status(err.status)
						.json({ status: err.status, data: err.data, message: err.message });
				}

				winston.error({ NEARBY_MERCHANTS_API_ERROR: "Internal Server Error" });
				return res.status(500).json({ status: 500, data: [] });
			}
		}
	);

	app.get(
		"/booking_merchants/api/v1/merchants/favorites",
		[
			AccessTokenVerifier,
			query("lat")
				.notEmpty()
				.withMessage("Missing required query: lat")
				.custom((value) => typeof +value === "number")
				.withMessage("Latitude must be in integer type."),
			query("lng")
				.notEmpty()
				.withMessage("Missing required query: lng")
				.custom((value) => typeof +value === "number")
				.withMessage("Longitude must be in integer type."),
		],
		async (req, res) => {
			const { lat, lng } = req.query;

			winston.info({
				FAVORITE_MERCHANTS_API_REQUEST: { lat, lng, user_id: req.id },
			});
			try {
				validate(req, res);

				const response = await service.GetFavoriteMerchants({
					user_id: parseInt(req.id),
					location: { lat: lat, lng: lng },
				});

				winston.info({
					FAVORITE_MERCHANTS_API_RESPONSE: {
						status: 200,
					},
				});

				return res.status(200).json({ status: 200, data: response });
			} catch (err) {
				if (err !== null) {
					winston.error({ FAVORITE_MERCHANTS_API_ERROR: err });
					winston.error(err.data);
					return res
						.status(err.status ? err.status : 500)
						.json({ status: err.status, data: err.data, message: err.message });
				}

				winston.error({
					FAVORITE_MERCHANTS_API_ERROR: "Internal Server Error",
				});
				return res.status(500).json({ status: 500, data: [] });
			}
		}
	);

	app.delete(
		"/booking_merchants/api/v1/merchants/favorites",
		[
			AccessTokenVerifier,
			query("merchant_id").notEmpty().withMessage("Please provide merchant_id"),
		],
		async (req, res) => {
			const { merchant_id } = req.query;

			winston.info({
				REMOVE_MERCHANTS_FROM_FAVORITES_API_REQUEST: {
					user_id: req.id,
					merchant_id,
				},
			});
			try {
				validate(req, res);

				await service.RemoveMerchantsFromFavorites({
					user_id: req.id,
					merchant_id,
				});

				winston.info({
					REMOVE_MERCHANTS_FROM_FAVORITES_API_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res.status(200).json({ status: 200, data: [] });
			} catch (err) {
				if (err !== null) {
					winston.error({ REMOVE_MERCHANTS_FROM_FAVORITES_API_ERROR: err });
					winston.error(err.data);
					return res
						.status(err.status ? err.status : 500)
						.json({ status: err.status, data: err.data, message: err.message });
				}

				winston.error({
					REMOVE_MERCHANTS_FROM_FAVORITES_API_ERROR: "Internal Server Error",
				});
				return res.status(500).json({ status: 500, data: [] });
			}
		}
	);
};
