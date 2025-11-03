import Joi from "joi";
import {
  QUESTION_TYPES,
  QUESTION_STATUSES,
  QUESTIONS_ALLOWED_SORT,
} from "#root/constants/index.js";

export const createQuestionSchema = Joi.object({
  questionText: Joi.string().min(1).required(),
  companyId: Joi.string().uuid().allow(null).empty("").optional(),
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
  companyId: Joi.string().uuid().allow(null).empty("").optional(),
  type: Joi.string()
    .valid(...QUESTION_TYPES)
    .optional(),
  choices: Joi.array().items(Joi.string().required()).optional(),
  status: Joi.string()
    .valid(...QUESTION_STATUSES)
    .optional(),
});

export const listQuestionsQuerySchema = Joi.object({
  companyId: Joi.string().uuid().allow(null).empty("").optional(),
  status: Joi.string()
    .valid(...QUESTION_STATUSES)
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
  search: Joi.string().allow("").optional(),
  sortBy: Joi.string()
    .valid(...QUESTIONS_ALLOWED_SORT)
    .default("createdAt"),
  order: Joi.string().lowercase().valid("asc", "desc").default("desc"),
  all: Joi.boolean()
    .truthy("1")
    .truthy("true")
    .falsy("0")
    .falsy("false")
    .default(false),
}).rename("q", "search", { ignoreUndefined: true, override: true });
