"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
// Singleton simples para evitar múltiplas instâncias em dev.
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
// Prisma 7 (driver adapters): precisamos passar um adapter válido para SQLite.
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
