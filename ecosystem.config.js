//config app for PM2
module.exports = {
	apps: [
		{
			name: "booking-nearby-merchants:4004", //label
			script: "server.js", //entrypoint
		},
	],
};
