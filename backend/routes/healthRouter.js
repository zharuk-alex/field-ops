// routes/healthRouter.js

import { Router } from "express";
import sequelize from "../db/Sequelize.js";

const router = Router();

router.get("/live", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "api",
    ts: new Date().toISOString(),
  });
});

router.get("/ready", async (_req, res) => {
  try {
    await sequelize.query("select 1;");
    res.status(200).json({
      status: "ok",
      db: "up",
      ts: new Date().toISOString(),
    });
  } catch (e) {
    res.status(503).json({
      status: "degraded",
      db: "down",
      error: e.message,
      ts: new Date().toISOString(),
    });
  }
});

export default router;
