-- CreateTable
CREATE TABLE "Check" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelName" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "shift" INTEGER NOT NULL,
    "stripchat" REAL NOT NULL DEFAULT 0,
    "chaturbate" REAL NOT NULL DEFAULT 0,
    "cam4" REAL NOT NULL DEFAULT 0,
    "bongacams" REAL NOT NULL DEFAULT 0,
    "camsoda" REAL NOT NULL DEFAULT 0,
    "tonplace" REAL NOT NULL DEFAULT 0,
    "livejasmin" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Check_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
