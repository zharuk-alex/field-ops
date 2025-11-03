import express from "express";
import authenticate from "../middlewares/authenticate.js";
import requireRole from "../middlewares/requireRole.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

import {
  getCompany,
  createCompany,
  listCompanies,
  updateCompany,
} from "../controllers/companiesController.js";

const router = express.Router();

router.use(authenticate);

router.post("/", requireRole("admin", "manager"), ctrlWrapper(createCompany));
router.get("/", requireRole("admin", "manager"), ctrlWrapper(listCompanies));
router.get("/:id", requireRole("admin", "manager"), ctrlWrapper(getCompany));
router.put("/:id", requireRole("admin"), ctrlWrapper(updateCompany));
router.patch("/:id", requireRole("admin"), ctrlWrapper(updateCompany));

export default router;
