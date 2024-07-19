const path = require("path");
require("dotenv").config({
	debug:
		process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "test"
			? true
			: true,
	path: path.resolve(__dirname, ".env"),
});
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const app = express();

// Loggers
const morgan = require("morgan");
const winston = require("./config/winston");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
const compression = require("compression");

const shouldCompress = (req, res) => {
	if (req.headers["x-no-compression"]) {
		// don't compress responses if this request header is present
		return false;
	}

	// fallback to standard compression
	return compression.filter(req, res);
};

// Global Middlewares
app.use(helmet());
app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"https://v2-stg-parkncharge.sysnetph.com",
		],
		methods: ["OPTIONS", "GET", "POST", "PUT", "DELETE", "PATCH"],
	})
);
app.use(express.urlencoded({ extended: false })); // To parse the urlencoded : x-www-form-urlencoded
app.use(express.json()); // To parse the json()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: winston.stream }));
app.use(cookieParser());
app.use(compression({ filter: shouldCompress, threshold: 0 }));

require("./api/merchants.api")(app);
require("./api/favorite_merchants.api")(app);

app.use(
	"/booking_merchants/graphql",
	graphqlHTTP((req, res) => {
		return {
			schema,
			graphiql: true,
			context: {
				auth: req.headers.authorization,
			},
			customFormatErrorFn: (error) => {
				return {
					message: error.originalError.message
						? error.originalError.message
						: "Internal Server Error",
					status: error.originalError.status ? error.originalError.status : 500,
				};
			},
		};
	})
);

app.use("*", (_req, res, _next) => {
	return res.status(404).json({ status: 404, data: [], message: "Not Found" });
});

module.exports = app;
