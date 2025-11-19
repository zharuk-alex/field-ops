import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.get("/stats", authenticate, getDashboardStats);

export default router;
