const MerchantsService = require("../services/MerchantsService");
const { validationResult, body } = require("express-validator");
const winston = require("../config/winston");
const { BasicTokenVerifier } = require("../middlewares/TokenMiddleware");
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
	app.get(
		"/api/v1/nearby_merchants",
		[
			BasicTokenVerifier,
			body("lat").notEmpty().withMessage("Please provide your latitude"),
			body("lng").notEmpty().withMessage("Please provide your longtitude"),
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
				winston.info({ NEARBY_MERCHANTS_API_RESPONSE: result.length });

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

	app.get(
		"/api/v1/filter-merchants",
		[
			BasicTokenVerifier,
			body("location")
				.notEmpty()
				.withMessage("Missing required property: location"),
			body("location.lat")
				.if(body("location").exists())
				.notEmpty()
				.withMessage("Missing required property: lat (location latitude)")
				.isDecimal(),
			body("location.lng")
				.if(body("location").exists())
				.notEmpty()
				.withMessage("Missing required property: lng (location longtitude)"),
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
};
