-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "dueDate" DATETIME NOT NULL,
    "nextDueDate" DATETIME,
    "recurrence" TEXT NOT NULL DEFAULT 'NONE',
    "lastPaidAt" DATETIME,
    "installmentCount" INTEGER,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Bill" ("amount", "createdAt", "currency", "dueDate", "id", "lastPaidAt", "nextDueDate", "recurrence", "title", "updatedAt") SELECT "amount", "createdAt", "currency", "dueDate", "id", "lastPaidAt", "nextDueDate", "recurrence", "title", "updatedAt" FROM "Bill";
DROP TABLE "Bill";
ALTER TABLE "new_Bill" RENAME TO "Bill";
CREATE INDEX "Bill_recurrence_idx" ON "Bill"("recurrence");
CREATE INDEX "Bill_nextDueDate_idx" ON "Bill"("nextDueDate");
CREATE INDEX "Bill_paymentStatus_idx" ON "Bill"("paymentStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
