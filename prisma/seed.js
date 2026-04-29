import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";

const { PrismaClient } = pkg;

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@crm.com" },
    update: {},
    create: {
      email: "admin@crm.com",
      username: "admin",
      password: adminPassword,
      role: "admin",
    },
  });

  const platforms = [
    { name: "Stripchat", key: "stripchat" },
    { name: "Chaturbate", key: "chaturbate" },
    { name: "Cam4", key: "cam4" },
    { name: "BongaCams", key: "bongacams" },
    { name: "Camsoda", key: "camsoda" },
    { name: "Ton.place", key: "tonplace" },
    { name: "LiveJasmin", key: "livejasmin" },
  ];

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { key: platform.key },
      update: {
        name: platform.name,
        isActive: true,
      },
      create: platform,
    });
  }

  await prisma.payoutSettings.upsert({
    where: { id: 1 },
    update: {
      modelPercent: 30,
      operatorPercent: 20,
      studioPercent: 50,
    },
    create: {
      id: 1,
      modelPercent: 30,
      operatorPercent: 20,
      studioPercent: 50,
    },
  });

  console.log("Seed completed");
  console.log("Admin: admin@crm.com / admin123");
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });