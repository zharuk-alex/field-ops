import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import requireRole from "../middlewares/requireRole.js";
import validateBody from "../decorators/validateBody.js";
import validateQuery from "../decorators/validateQuery.js";

import {
  createTemplateSchema,
  updateTemplateSchema,
  listTemplatesSchema,
} from "../validators/templates.js";

import {
  createTemplate,
  listTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/templatesController.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRole("manager", "admin"),
  validateBody(createTemplateSchema),
  ctrlWrapper(createTemplate)
);

router.get(
  "/",
  authenticate,
  validateQuery(listTemplatesSchema),
  ctrlWrapper(listTemplates)
);

router.get("/:id", authenticate, ctrlWrapper(getTemplate));

router.put(
  "/:id",
  authenticate,
  requireRole("manager", "admin"),
  validateBody(updateTemplateSchema),
  ctrlWrapper(updateTemplate)
);

router.delete(
  "/:id",
  authenticate,
  requireRole("manager", "admin"),
  ctrlWrapper(deleteTemplate)
);

export default router;
