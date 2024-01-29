require("dotenv").config();
var mysql = require("mysql2");
const logger = require("../config/winston");

let pool = mysql.createPool({
	connectionLimit: process.env.DB_CONNECTION_LIMIT,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD, // Default and standard password here in sysnet.
	database: process.env.DB_DATABASE,
});

pool.getConnection(function (err, connection) {
	//declaration of db pooling
	if (err) {
		return console.error("error: " + err.message);
	}

	if (connection) {
		logger.info("Connected to DB");
		connection.release(); //reuse of connection every after access
	}
});

pool.on("release", function (connection) {
	logger.info("Connection %d released", connection.threadId);
});

module.exports = pool;
