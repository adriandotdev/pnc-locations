const MerchantsService = require("../services/MerchantsService");
const { validationResult, body } = require("express-validator");
const winston = require("../config/winston");
const {
	BasicTokenVerifier,
	AccessTokenVerifier,
} = require("../middlewares/TokenMiddleware");
const { HttpUnprocessableEntity } = require("../utils/HttpError");

module.exports = (app) => {
	const service = new MerchantsService();

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

	/** This API is for the  */
	app.post(
		"/booking_merchants/api/v1/nearby_merchants",
		[
			BasicTokenVerifier,
			body("lat")
				.notEmpty()
				.withMessage("Missing required property: lat (latitude)")
				.custom((value) => typeof value === "number")
				.withMessage(
					"Latitude must be in number type. Example of valid latitude: 14.5564414"
				),
			body("lng")
				.notEmpty()
				.withMessage("Missing required property: lng (longitude)")
				.custom((value) => typeof value === "number")
				.withMessage(
					"Longitude must be in number type. Example of valid longitude: 121.0218253"
				),
		],
		async (req, res) => {
			const { lat, lng } = req.body;

			winston.info({
				NEARBY_MERCHANTS_API_REQUEST: {
					lat,
					lng,
				},
			});

			try {
				validate(req, res);

				const result = await service.GetNearbyMerchants(lat, lng);
				winston.info({
					NEARBY_MERCHANTS_API_RESPONSE: {
						lat,
						lng,
						no_of_merchants: result.length,
					},
				});

				return res.status(200).json({ status: 200, data: result });
			} catch (err) {
				if (err !== null) {
					winston.error({ NEARBY_MERCHANTS_API_ERROR: err });
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

	app.post(
		"/booking_merchants/api/v1/filter-merchants",
		[
			BasicTokenVerifier,
			body("location")
				.notEmpty()
				.withMessage("Missing required property: location"),
			body("location.lat")
				.if(body("location").exists())
				.notEmpty()
				.withMessage(
					"Missing required property: lat (latitude). Example of valid latitude: 14.5564414"
				)
				.isDecimal(),
			body("location.lng")
				.if(body("location").exists())
				.notEmpty()
				.withMessage(
					"Missing required property: lng (longitude). Example of valid longitude: 121.0218253"
				),
			body("filter")
				.notEmpty()
				.withMessage("Missing required property: filter"),
			body("filter.city")
				.if(body("filter").exists())
				.notEmpty()
				.withMessage("Missing required property: city"),
			body("filter.region")
				.if(body("filter").exists())
				.notEmpty()
				.withMessage("Missing required property: region"),
			body("filter.types")
				.if(body("filter").exists())
				.notEmpty()
				.withMessage("Missing required property: types")
				.custom((value) => value.length > 0)
				.withMessage("Please provide atleast one (1) charger type"),
			body("filter.meter_types")
				.if(body("filter").exists())
				.notEmpty()
				.withMessage("Missing required property: meter_types")
				.custom((value) => value.length > 0)
				.withMessage("Please provide atleast one (1) meter type"),
		],
		async (req, res) => {
			const { location, filter } = req.body;

			winston.info({ FILTER_MERCHANTS_API_REQUEST: { location, filter } });

			try {
				validate(req, res);

				const response = await service.GetFilteredMerchants(location, filter);

				winston.info({ FILTER_MERCHANTS_API_RESPONSE: response });

				return res.json({ status: 200, data: response });
			} catch (err) {
				if (err !== null) {
					winston.error({
						FILTER_MERCHANTS_API_ERROR: {
							message: err.message,
						},
					});
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

	app.post(
		"/booking_merchants/api/v1/nearby-favorite-merchants",
		[
			AccessTokenVerifier,
			body("lat")
				.notEmpty()
				.withMessage(
					"Missing required property: lat (latitude). Example of valid latitude: 14.5564414."
				)
				.custom((value) => typeof value === "number")
				.withMessage("Latitude must be in number type."),
			body("lng")
				.notEmpty()
				.withMessage(
					"Missing required property: lng (longitude). Example of valid longitude: 121.0218253."
				)
				.custom((value) => typeof value === "number")
				.withMessage("Longitude must be in number type."),
		],
		async (req, res) => {
			const { lat, lng } = req.body;

			winston.info({
				NEARBY_MERCHANTS_API_REQUEST: {
					lat,
					lng,
				},
			});

			try {
				validate(req, res);

				const result = await service.GetNearbyAndFavoriteMerchants({
					user_id: req.id,
					lat,
					lng,
				});
				winston.info({
					NEARBY_MERCHANTS_API_RESPONSE: {
						lat,
						lng,
						no_of_merchants: result.length,
					},
				});

				return res.status(200).json({ status: 200, data: result });
			} catch (err) {
				if (err !== null) {
					winston.error({ NEARBY_MERCHANTS_API_ERROR: err });
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

	app.post(
		"/booking_merchants/api/v1/filtered-favorite-merchants",
		[
			AccessTokenVerifier,
			body("location")
				.notEmpty()
				.withMessage("Missing required property: location"),
			body("location.lat")
				.if(body("location").exists())
				.notEmpty()
				.withMessage(
					"Missing required property: lat (latitude). Example of valid latitude: 14.5564414."
				)
				.isDecimal(),
			body("location.lng")
				.if(body("location").exists())
				.notEmpty()
				.withMessage(
					"Missing required property: lng (longitude). Example of valid longitude: 121.0218253."
				),
			body("filter")
				.notEmpty()
				.withMessage("Missing required property: filter"),
			body("filter.city")
				.if(body("filter").exists())
				.notEmpty()
				.withMessage("Missing required property: city"),
			body("filter.region")
				.if(body("filter").exists())
				.notEmpty()
				.withMessage("Missing required property: region"),
			body("filter.types")
				.if(body("filter").exists())
				.notEmpty()
				.withMessage("Missing required property: types")
				.custom((value) => value.length > 0)
				.withMessage("Please provide atleast one (1) charger type"),
			body("filter.meter_types")
				.if(body("filter").exists())
				.notEmpty()
				.withMessage("Missing required property: meter_types")
				.custom((value) => value.length > 0)
				.withMessage("Please provide atleast one (1) meter type"),
		],
		async (req, res) => {
			const { location, filter } = req.body;

			winston.info({
				FILTER_MERCHANTS_WITH_FAVORITES_API_REQUEST: { location, filter },
			});

			try {
				validate(req, res);

				const response = await service.GetFilteredMerchantsWithFavorites({
					user_id: req.id,
					location,
					filter,
				});

				winston.info({ FILTER_MERCHANTS_WITH_FAVORITES_API_REQUEST: response });

				return res.json({ status: 200, data: response });
			} catch (err) {
				if (err !== null) {
					winston.error({
						FILTER_MERCHANTS_WITH_FAVORITES_API_ERROR: {
							message: err.message,
						},
					});
					winston.error(err.data);

					return res
						.status(err.status)
						.json({ status: err.status, data: err.data, message: err.message });
				}

				winston.error({
					FILTER_MERCHANTS_WITH_FAVORITES_API_ERROR: "Internal Server Error",
				});
				return res.status(500).json({ status: 500, data: [] });
			}
		}
	);
};
