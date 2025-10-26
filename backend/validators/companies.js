import Joi from "joi";

export const createCompanySchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  timezone: Joi.string().optional().allow("", null),
  locale: Joi.string().optional().allow("", null),
});

export const listCompaniesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
});
