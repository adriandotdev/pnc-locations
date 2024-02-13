const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();

// Loggers
const morgan = require("morgan");
const winston = require("./config/winston");
const { graphqlHTTP } = require("express-graphql");

const schema = require("./graphql/schema");

// Global Middlewares
app.use(
	cors({
		origin: "*",
		methods: ["OPTIONS", "GET", "POST", "PUT", "DELETE", "PATCH"],
	})
);
app.use(express.urlencoded({ extended: false })); // To parse the urlencoded : x-www-form-urlencoded
app.use(express.json()); // To parse the json()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: winston.stream }));
app.use(cookieParser());

require("./api/merchants.api")(app);
require("./api/favorite_merchants.api")(app);

app.use(
	"/booking_merchants/graphql",
	graphqlHTTP((req, res) => {
		return {
			schema,
			graphiql: true,
			context: {
				auth: req.headers.authorization?.split(" ")[1],
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
