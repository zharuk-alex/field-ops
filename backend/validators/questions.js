import Joi from "joi";
import { QUESTION_TYPES, QUESTION_STATUSES } from "#root/constants/index.js";

export const createQuestionSchema = Joi.object({
  questionText: Joi.string().min(1).required(),
  companyId: Joi.string().uuid().optional(),
  type: Joi.string()
    .valid(...QUESTION_TYPES)
    .required(),
  choices: Joi.when("type", {
    is: "choice",
    then: Joi.array().items(Joi.string().required()).min(1).required(),
    otherwise: Joi.forbidden(),
  }),
  status: Joi.string()
    .valid(...QUESTION_STATUSES)
    .default("active"),
});

export const updateQuestionSchema = Joi.object({
  questionText: Joi.string().min(1).optional(),
  companyId: Joi.string().uuid().optional(),
  type: Joi.string()
    .valid(...QUESTION_TYPES)
    .optional(),
  choices: Joi.array().items(Joi.string().required()).optional(),
  status: Joi.string()
    .valid(...QUESTION_STATUSES)
    .optional(),
});

export const listQuestionsQuerySchema = Joi.object({
  companyId: Joi.string().uuid().optional(),
  status: Joi.string()
    .valid(...QUESTION_STATUSES)
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  q: Joi.string().allow("").optional(),
});
