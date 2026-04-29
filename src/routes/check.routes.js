import express from "express";
import prisma from "../db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

function toNumber(v) {
  return Number(v) || 0;
}

// 👉 получить все чеки (админ)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const checks = await prisma.check.findMany({
      include: {
        model: true,
        operator: {
          select: { id: true, username: true },
        },
        incomes: {
          include: {
            platform: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(checks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Ошибка получения чеков" });
  }
});

// 👉 создать чек (оператор)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      modelName,
      date,
      shift,
      incomes, // { stripchat: 100, cam4: 50 ... }
    } = req.body;

    if (!modelName || !date || !shift) {
      return res.status(400).json({ message: "Заполни обязательные поля" });
    }

    // 1. модель
    let model = await prisma.studioModel.findFirst({
      where: { name: modelName },
    });

    if (!model) {
      model = await prisma.studioModel.create({
        data: { name: modelName },
      });
    }

    // 2. платформы
    const platforms = await prisma.platform.findMany();

    let total = 0;
    const incomeData = [];

    for (const platform of platforms) {
      const amount = toNumber(incomes?.[platform.key]);

      if (amount > 0) {
        total += amount;

        incomeData.push({
          platformId: platform.id,
          amount,
        });
      }
    }

    // 3. проценты
    const payout = await prisma.payoutSettings.findFirst();

    const modelAmount = (total * payout.modelPercent) / 100;
    const operatorAmount = (total * payout.operatorPercent) / 100;
    const studioAmount = (total * payout.studioPercent) / 100;

    // 4. создаём чек
    const check = await prisma.check.create({
      data: {
        modelId: model.id,
        operatorId: req.user.id,
        date: new Date(date),
        shift: Number(shift),

        total,
        modelAmount,
        operatorAmount,
        studioAmount,

        incomes: {
          create: incomeData,
        },
      },
      include: {
        model: true,
        incomes: {
          include: { platform: true },
        },
      },
    });

    res.json(check);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Ошибка создания чека" });
  }
});

router.patch("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const checkId = Number(req.params.id);
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Некорректный статус" });
    }

    const check = await prisma.check.update({
      where: { id: checkId },
      data: { status },
    });

    res.json({
      message: "Статус обновлён",
      check,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка обновления статуса" });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const checkId = Number(req.params.id);

    const check = await prisma.check.findUnique({
      where: { id: checkId },
    });

    if (!check) {
      return res.status(404).json({ message: "Чек не найден" });
    }

    await prisma.check.delete({
      where: { id: checkId },
    });

    res.json({ message: "Чек удалён" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка удаления чека" });
  }
});

export default router;