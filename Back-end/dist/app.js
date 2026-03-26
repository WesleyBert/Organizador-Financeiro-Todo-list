"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const notes_1 = __importDefault(require("./routes/notes"));
const health_1 = __importDefault(require("./routes/health"));
const passwords_1 = __importDefault(require("./routes/passwords"));
const todo_1 = __importDefault(require("./routes/todo"));
const finance_1 = __importDefault(require("./routes/finance"));
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: '1mb' }));
    const corsOrigin = process.env.CORS_ORIGIN?.trim();
    const corsOptions = !corsOrigin || corsOrigin === '*'
        ? { origin: true }
        : {
            origin: corsOrigin.split(',').map(s => s.trim()),
        };
    app.use((0, cors_1.default)(corsOptions));
    app.get('/', (_req, res) => {
        res.json({ name: 'back-end', status: 'ok' });
    });
    app.use('/api/health', health_1.default);
    app.use('/api/notes', notes_1.default);
    app.use('/api/passwords', passwords_1.default);
    app.use('/api/todo', todo_1.default);
    // O router de finanças define rotas começando em `/bills` e `/finance/...`
    // então ele é montado em `/api`.
    app.use('/api', finance_1.default);
    return app;
}
