"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = require("http");
const app_1 = require("./app");
const port = Number(process.env.PORT || 3001);
const app = (0, app_1.createApp)();
// Express/Router
const server = (0, http_1.createServer)(app);
server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[back-end] rodando na porta ${port}`);
});
