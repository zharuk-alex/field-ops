import { Router } from "express";

import ctrlWrapper from "../decorators/ctrlWrapper.js";
import authenticate from "../middlewares/authenticate.js";

import { getTemplates, submitAudit } from "../controllers/pwaController.js";

const pwaRouter = Router();

pwaRouter.get("/templates", authenticate, ctrlWrapper(getTemplates));
pwaRouter.post("/audits/submit", authenticate, ctrlWrapper(submitAudit));

export default pwaRouter;
