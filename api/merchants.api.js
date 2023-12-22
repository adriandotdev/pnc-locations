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

	app.get(
		"/api/v1/nearby_merchants",
		[
			BasicTokenVerifier,
			body("lat").notEmpty().withMessage("Please provide your latitude"),
			body("lng").notEmpty().withMessage("Please provide your longtitude"),
		],
		async (req, res) => {
			winston.info("NEARBY_MERCHANTS_REQUEST");

			const { lat, lng } = req.body;

			winston.info({
				NEARBY_MERCHANT_REQUEST_DATA: {
					lat,
					lng,
				},
			});

			try {
				validate(req, res);

				const result = await service.GetNearbyMerchants(lat, lng);

				winston.info({ NEARBY_MERCHANT_REQUEST: "SUCCESS" });
				winston.info({ NEARBY_MERCHANTS_API_RESPONSE_DATA: result });

				return res.status(200).json({ status: 200, data: result });
			} catch (err) {
				if (err !== null) {
					winston.error({ NEARBY_MERCHANTS_ERROR: err });
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
		"/api/v1/filter-merchants",
		[BasicTokenVerifier],
		async (req, res) => {
			const { location, filter } = req.body;

			winston.info({ FILTER_MERCHANTS_REQUEST: "REQUEST STARTED" });
			winston.info({ RECEIVED_DATA: { location, filter } });

			try {
				const response = await service.GetFilteredMerchants(location, filter);

				winston.info({ FILTER_MERCHANTS: "SUCCESS" });
				winston.info({ FILTER_MERCHANTS: response });

				return res.json({ status: 200, data: response });
			} catch (err) {
				if (err !== null) {
					winston.error({ NEARBY_MERCHANTS_ERROR: err });
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
};
