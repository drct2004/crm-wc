/*
  Warnings:

  - You are about to drop the column `bongacams` on the `Check` table. All the data in the column will be lost.
  - You are about to drop the column `cam4` on the `Check` table. All the data in the column will be lost.
  - You are about to drop the column `camsoda` on the `Check` table. All the data in the column will be lost.
  - You are about to drop the column `chaturbate` on the `Check` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Check` table. All the data in the column will be lost.
  - You are about to drop the column `livejasmin` on the `Check` table. All the data in the column will be lost.
  - You are about to drop the column `modelName` on the `Check` table. All the data in the column will be lost.
  - You are about to drop the column `stripchat` on the `Check` table. All the data in the column will be lost.
  - You are about to drop the column `tonplace` on the `Check` table. All the data in the column will be lost.
  - Added the required column `modelId` to the `Check` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "StudioModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "PayoutSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "modelPercent" REAL NOT NULL DEFAULT 30,
    "operatorPercent" REAL NOT NULL DEFAULT 20,
    "studioPercent" REAL NOT NULL DEFAULT 50,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CheckIncome" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checkId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "CheckIncome_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "Check" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CheckIncome_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Check" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelId" INTEGER NOT NULL,
    "operatorId" INTEGER,
    "date" DATETIME NOT NULL,
    "shift" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total" REAL NOT NULL DEFAULT 0,
    "modelAmount" REAL NOT NULL DEFAULT 0,
    "operatorAmount" REAL NOT NULL DEFAULT 0,
    "studioAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Check_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "StudioModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Check_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Check" ("createdAt", "date", "id", "shift", "status", "total", "updatedAt") SELECT "createdAt", "date", "id", "shift", "status", "total", "updatedAt" FROM "Check";
DROP TABLE "Check";
ALTER TABLE "new_Check" RENAME TO "Check";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "password", "role", "username") SELECT "createdAt", "email", "id", "password", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Platform_key_key" ON "Platform"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIncome_checkId_platformId_key" ON "CheckIncome"("checkId", "platformId");
