var mysql = require("mysql2");
const config = require("../config/config");

let pool = mysql.createPool({
	connectionLimit: config.db.connection_limit,
	host: config.db.host,
	user: config.db.user,
	password: config.db.password, // Default and standard password here in sysnet.
	database: config.db.database,
});

pool.getConnection(function (err, connection) {
	//declaration of db pooling
	if (err) {
		return console.error("error: " + err.message);
	}

	if (connection) {
		console.log("Connected to DB");
		connection.release(); //reuse of connection every after access
	}
});

pool.on("release", function (connection) {
	console.log("Connection %d released", connection.threadId);
});

module.exports = pool;
