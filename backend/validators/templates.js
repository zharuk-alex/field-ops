import Joi from "joi";
import { QUESTION_TYPES } from "#root/constants/index.js";

const questionSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  questionText: Joi.string().trim().min(1).required(),
  type: Joi.string()
    .valid(...QUESTION_TYPES)
    .required(),
  choices: Joi.array().items(Joi.string().trim()).default([]),
  required: Joi.boolean().default(false),
  order: Joi.number().integer().min(0).optional(),
});

export const createTemplateSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("", null),
  companyId: Joi.string().guid({ version: "uuidv4" }).optional(),
  questions: Joi.array().items(questionSchema).optional(),
});

export const updateTemplateSchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow("", null),
  companyId: Joi.string().uuid().optional(),
  questions: Joi.array().items(questionSchema).optional(),
});

export const listTemplatesSchema = Joi.object({
  companyId: Joi.string().uuid().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
