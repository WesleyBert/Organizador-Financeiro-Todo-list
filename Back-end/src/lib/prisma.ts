import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// Singleton simples para evitar múltiplas instâncias em dev.
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

// Prisma 7 (driver adapters): precisamos passar um adapter válido para SQLite.
const adapter = new PrismaBetterSqlite3({ url: databaseUrl })

const prisma = new PrismaClient({ adapter })

export default prisma

