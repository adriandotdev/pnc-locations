const nodemailer = require("nodemailer");
const config = require("../config/config");
const winston = require("../config/winston");

const transporter = nodemailer.createTransport({
	name: config.nodemailer?.name,
	host: config.nodemailer.host,
	port: config.nodemailer.port,
	secure: config.nodemailer.secure,
	auth: {
		user: config.nodemailer.user,
		pass: config.nodemailer.password,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

module.exports = class Email {
	constructor(email_address, data) {
		this._email_address = email_address;
		this._data = data;
	}

	async SendOTP() {
		winston.info("Send Email To CPO Function");

		winston.info("EMAIL RECIPIENT: " + this._email_address);

		try {
			let htmlFormat = `
			  <h1>ParkNcharge</h1>
	
			  <h2>PLEASE DO NOT SHARE THIS OTP TO ANYONE</h2>
			  ${this._data.otp}
			  
			  <p>Kind regards,</p>
			  <p><b>ParkNcharge</b></p>
			`;

			let textFormat = `ParkNcharge\n\nPLEASE DO NOT SHARE THIS OTP TO ANYONE\n\nKind regards,\nParkNCharge`;
			// send mail with defined transport object
			const info = await transporter.sendMail({
				from: config.nodemailer.user, // sender address
				to: this._email_address, // list of receivers
				subject: "ParkNcharge Credentials (no-reply)", // Subject line
				text: textFormat, // plain text body
				html: htmlFormat, // html body
			});

			winston.info("Message sent: APPROVED %s", info.messageId);
		} catch (err) {
			console.log(err);
			throw new Error({ connection: data.connection });
		}
	}
};
