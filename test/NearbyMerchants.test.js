const request = require("supertest");
const mysql = require("../database/mysql");
const app = require("../app");

const PORT = 4001;

const server = app.listen(PORT, () => {
	console.log(`PORT LISTENING IN ${PORT}`);
});

describe("Nearby Merchants API", () => {
	beforeAll(async () => {
		mysql.on("connection", () => {
			console.log("SQL Connected");
		});
	}, 5000);

	afterAll((done) => {
		server.close(done);
		mysql.end();
	}, 5000);

	test("Should return 200", async () => {
		const res = await request(app)
			.post("/booking_merchants/api/v1/nearby_merchants")
			.send({
				lat: 14.5564414,
				lng: 121.0218253,
			})
			.set(
				"Authorization",
				"Basic eyJhbGciOiJIUzI1NiJ9.cGFya25jaGFyZ2UtZGV2ZWxvcGVyLWFwaWtleQ.a2HEcaGP6po2yAAV-ieQNHbCoD6nMGDNWs3fGjrGJds"
			);

		expect(res.status).toBe(200);
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("status");
		expect(res.body.status).toBe(200);
		expect(res.body).toHaveProperty("data");
		expect(res.body.data).toBeInstanceOf(Array);
	}, 3000);

	test("should pass if all of merchant objects have all required properties", async () => {
		const res = await request(app)
			.post("/booking_merchants/api/v1/nearby_merchants")
			.send({
				lat: 14.5564414,
				lng: 121.0218253,
			})
			.set(
				"Authorization",
				"Basic eyJhbGciOiJIUzI1NiJ9.cGFya25jaGFyZ2UtZGV2ZWxvcGVyLWFwaWtleQ.a2HEcaGP6po2yAAV-ieQNHbCoD6nMGDNWs3fGjrGJds"
			);

		expect(res.body).toHaveProperty("data");

		res.body.data.forEach((merchant) => {
			expect(merchant).toHaveProperty("merchant_id");
			expect(merchant).toHaveProperty("merchant");
			expect(merchant).toHaveProperty("building_name");
			expect(merchant).toHaveProperty("lat");
			expect(merchant).toHaveProperty("lng");
			expect(merchant).toHaveProperty("distance");
			expect(merchant).toHaveProperty("very_nearby");
			expect(merchant).toHaveProperty("formatted_address");
			expect(merchant).toHaveProperty("city");
			expect(merchant).toHaveProperty("region");
			expect(merchant).toHaveProperty("country");
			expect(merchant).toHaveProperty("country_code");
			expect(merchant).toHaveProperty("stations");
			expect(merchant).toHaveProperty("amenities");
		});
	}, 3000);

	test("should return 401 if the authorization is invalid", async () => {
		const res = await request(app)
			.post("/booking_merchants/api/v1/nearby_merchants")
			.send({
				lat: 14.5564414,
				lng: 121.0218253,
			})
			.set(
				"Authorization",
				"Basic eyJhbGciOiJasdfasdfasdfasdfIUzI1NiJ9.cGFya25asdfasdfasdfjaGFyZ2UtZGV2ZWxvcGVyLWFwaWtleQ.a2HEcaGP6po2yAAV-ieQNHbCoD6nMGDNWs3fGjrGJds"
			);

		expect(res.status).toBe(401);
		expect(res.statusCode).toBe(401);
		expect(res.body.status).toBe(401);
	}, 3000);

	test("should return 401 if the authorization is not set", async () => {
		const res = await request(app)
			.post("/booking_merchants/api/v1/nearby_merchants")
			.send({
				lat: 14.5564414,
				lng: 121.0218253,
			});

		expect(res.status).toBe(401);
		expect(res.statusCode).toBe(401);
		expect(res.body.status).toBe(401);
	}, 3000);

	test("should return 401 if the authorization is without 'Basic' word", async () => {
		const res = await request(app)
			.post("/booking_merchants/api/v1/nearby_merchants")
			.send({
				lat: 14.5564414,
				lng: 121.0218253,
			})
			.set(
				"Authorization",
				"eyJhbGciOiJasdfasdfasdfasdfIUzI1NiJ9.cGFya25asdfasdfasdfjaGFyZ2UtZGV2ZWxvcGVyLWFwaWtleQ.a2HEcaGP6po2yAAV-ieQNHbCoD6nMGDNWs3fGjrGJds"
			);

		expect(res.status).toBe(401);
		expect(res.statusCode).toBe(401);
		expect(res.body.status).toBe(401);
	}, 3000);

	test("should return 422 when 'lat' is not provided", async () => {
		const res = await request(app)
			.post("/booking_merchants/api/v1/nearby_merchants")
			.send({
				lng: 121.0218253,
			})
			.set(
				"Authorization",
				"Basic eyJhbGciOiJIUzI1NiJ9.cGFya25jaGFyZ2UtZGV2ZWxvcGVyLWFwaWtleQ.a2HEcaGP6po2yAAV-ieQNHbCoD6nMGDNWs3fGjrGJds"
			);

		expect(res.status).toBe(422);
		expect(res.statusCode).toBe(422);
		expect(res.body.status).toBe(422);
	}, 3000);

	test("should return 422 when 'lng' is not provided", async () => {
		const res = await request(app)
			.post("/booking_merchants/api/v1/nearby_merchants")
			.send({
				lat: 14.5564414,
			})
			.set(
				"Authorization",
				"Basic eyJhbGciOiJIUzI1NiJ9.cGFya25jaGFyZ2UtZGV2ZWxvcGVyLWFwaWtleQ.a2HEcaGP6po2yAAV-ieQNHbCoD6nMGDNWs3fGjrGJds"
			);

		expect(res.status).toBe(422);
		expect(res.statusCode).toBe(422);
		expect(res.body.status).toBe(422);
	}, 3000);
});
