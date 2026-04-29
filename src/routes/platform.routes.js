import express from "express";
import prisma from "../db.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const platforms = await prisma.platform.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
    });

    res.json(platforms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения площадок" });
  }
});

export default router;