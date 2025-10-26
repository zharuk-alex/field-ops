import Joi from "joi";

const questionSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  questionText: Joi.string().trim().min(1).required(),
  type: Joi.string()
    .valid("text", "number", "choice", "boolean", "photo")
    .required(),
  choices: Joi.array().items(Joi.string().trim()).default([]),
  required: Joi.boolean().default(false),
  order: Joi.number().integer().min(0).optional(),
});

export const createTemplateSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("", null),
  companyId: Joi.string().uuid().optional(),
  questions: Joi.array().items(questionSchema).min(1).required(),
});

export const updateTemplateSchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow("", null),
  companyId: Joi.string().uuid().optional(),
  questions: Joi.array().items(questionSchema).min(1).required(),
});

export const listTemplatesSchema = Joi.object({
  companyId: Joi.string().uuid().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
