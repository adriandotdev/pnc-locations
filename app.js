const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const config = require("./config/config");

// Loggers
const morgan = require("morgan");
const winston = require("./config/winston");

// Global Middlewares
app.use(
	cors({
		origin: "*",
		methods: ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
	})
);
app.use(express.urlencoded({ extended: false })); // To parse the urlencoded : x-www-form-urlencoded
app.use(express.json()); // To parse the json()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: winston.stream }));
app.use(cookieParser());

require("./api/merchants.api")(app);

module.exports = app;
