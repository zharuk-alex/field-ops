import express from "express";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import validateBody from "../decorators/validateBody.js";
import validateQuery from "../decorators/validateQuery.js";

import authenticate from "../middlewares/authenticate.js";
import requireRole from "../middlewares/requireRole.js";

import {
  createQuestion,
  listQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionsController.js";
import {
  createQuestionSchema,
  updateQuestionSchema,
  listQuestionsQuerySchema,
} from "../validators/questions.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  requireRole("admin", "manager"),
  validateBody(createQuestionSchema),
  ctrlWrapper(createQuestion)
);

router.get(
  "/",
  authenticate,
  requireRole("admin", "manager"),
  validateQuery(listQuestionsQuerySchema),
  ctrlWrapper(listQuestions)
);

router.get(
  "/:id",
  authenticate,
  requireRole("admin", "manager"),
  ctrlWrapper(getQuestion)
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin", "manager"),
  validateBody(updateQuestionSchema),
  ctrlWrapper(updateQuestion)
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin", "manager"),
  ctrlWrapper(deleteQuestion)
);

export default router;
