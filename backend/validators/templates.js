import Joi from "joi";

export const createTemplateSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("", null),
  companyId: Joi.string().uuid().optional(),
  questions: Joi.array().items(Joi.string().uuid()).default([]),
  locations: Joi.array().items(Joi.string().uuid()).default([]),
  status: Joi.string().valid("active", "inactive").default("active"),
});

export const updateTemplateSchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow("", null),
  companyId: Joi.string().uuid().optional(),
  questions: Joi.array().items(Joi.string().uuid()).optional(),
  locations: Joi.array().items(Joi.string().uuid()).optional(),
  status: Joi.string().valid("active", "inactive").optional(),
});

export const listTemplatesSchema = Joi.object({
  companyId: Joi.string().uuid().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
