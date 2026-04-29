import express from "express";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: role || "user",
      },
    });

    res.status(201).json({
      message: "Пользователь создан",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  res.json(users);
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (req.user.id === userId) {
      return res.status(400).json({
        message: "Нельзя удалить самого себя",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: "Пользователь удалён",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка удаления пользователя",
    });
  }
});

export default router;