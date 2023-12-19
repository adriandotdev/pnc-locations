const config = {}; //variable init of configuration files
config.server = {};
config.db = {};
config.nodemailer = {};
config.jwt = {};
config.secretKey = {};
config.logger = {};
config.googleAuth = {};
config.parkncharge = {};
config.encryption = {};
config.sms = {};

/* app settings */
config.server.port = 4002; // Change this port depending on your project.
config.server.env = "dev";

/* MySQL Database Setup */
config.db.host =
	config.server.env === "dev" || config.server.env === "test"
		? "localhost"
		: config.server.env === "stg"
		? "192.46.227.227"
		: "";
config.db.user = "root";
config.db.password = "4332wurx";
config.db.database =
	config.server.env === "dev"
		? "parkncharge"
		: config.server.env === "test"
		? "parkncharge_test"
		: config.server.env === "stg"
		? "parkncharge"
		: "";
config.db.connection_limit = 10;

/** Nodemailer Setup */
config.nodemailer.name = config.server.env === "stg" ? "hostgator" : "";
config.nodemailer.host =
	config.server.env === "dev" || config.server.env === "test"
		? "smtp.ethereal.email"
		: config.server.env === "stg"
		? "mail.parkncharge.com.ph"
		: "";

config.nodemailer.port =
	config.server.env === "dev" || config.server.env === "test"
		? 587
		: config.server.env === "stg"
		? 465
		: 0;

config.nodemailer.user =
	config.server.env === "dev" || config.server.env === "test"
		? "maud86@ethereal.email"
		: config.server.env === "stg"
		? "no-reply@parkncharge.com.ph"
		: "";

config.nodemailer.password =
	config.server.env === "dev" || config.server.env === "test"
		? "WhszSwcqeJdbpSpzTY"
		: config.server.env === "stg"
		? "4332wurx-2023"
		: "";

config.nodemailer.transport = "smtp";
config.nodemailer.secure =
	config.server.env === "dev" || config.server.env === "test"
		? false
		: config.server.env === "stg"
		? true
		: "";

config.nodemailer.path = "http://localhost:3002";

// JWT Secret Keys
config.jwt.accessTokenSecretKey = "parkncharge-4332wurx-access";
config.jwt.refreshTokenSecretKey = "parkncharge-4332wurx-refresh";

// username and secret key
config.secretKey.username = "sysnetparkncharge";
config.secretKey.password = "4332wurxparkncharge";

/* Winston Logger */
config.logger.maxsize = 52428800; // In Bytes
config.logger.maxFiles = 5;

// Google API
config.googleAuth.GEO_API_KEY = "AIzaSyASXoodW78ADiwCRsBog4MI9U_he10aTV8";

// HUB AuthModule SECRET KEY
config.parkncharge.secretKey = "sysnetintegratorsinc:parkncharge";

// Crypto Encryption
config.encryption.algorithm = "aes-256-cbc";
config.encryption.secret_key = "d6F3Efeqd6F3Efeqd6F3Efeqd6F3Efeq";
config.encryption.iv = "3bd269bc5b740457";

/* SMS */
config.sms.url = "https://messagingsuite.smart.com.ph//cgphttp/servlet/sendmsg";
config.sms.auth = "Basic anpzYXB1bEBzeXNuZXRwaC5jb206NDMzMld1cngh";
config.sms.source = "ParkNcharge";
config.sms.sourceNPI = 0;
config.sms.sourceTON = 5;

module.exports = config;
