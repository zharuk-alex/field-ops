import express from "express";
import authenticate from "../middlewares/authenticate.js";
import requireRole from "../middlewares/requireRole.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import {
  createAudit,
  listAudits,
  getAudit,
} from "../controllers/auditsController.js";

const router = express.Router();
router.use(authenticate);

router.post("/", requireRole("admin", "manager"), ctrlWrapper(createAudit));
router.get("/", requireRole("admin", "manager"), ctrlWrapper(listAudits));
router.get("/:id", requireRole("admin", "manager"), ctrlWrapper(getAudit));

export default router;
