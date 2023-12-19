const config = require("../config/config");
const crypto = require("crypto");
const algorithm = config.encryption.algorithm;
const iv = config.encryption.iv;
const key = config.encryption.secret_key;

module.exports = class Crypto {
	static Encrypt(text) {
		const cipher = crypto.createCipheriv(algorithm, key, iv);
		let encrypted = cipher.update(text, "utf-8", "base64");
		encrypted += cipher.final("base64");
		return encrypted;
	}

	static Decrypt(hash) {
		const decipher = crypto.createDecipheriv(algorithm, key, iv);
		let decryptedData = decipher.update(hash, "base64", "utf-8");
		decryptedData += decipher.final("utf-8");
		return decryptedData;
	}

	static Generate() {
		return {
			key: crypto.randomBytes(32).toString("base64").slice(0, 32),
			iv: crypto.randomBytes(16).toString("base64").slice(0, 16),
		};
	}
};
