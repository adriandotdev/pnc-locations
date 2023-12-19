const config = require("./config/config");
const app = require("./app");

const httpServer = require("http").createServer(app);

httpServer.listen(config.server.port, () => {
	console.log("server is running on port: " + config.server.port);
});
