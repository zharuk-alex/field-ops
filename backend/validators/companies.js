import Joi from "joi";

export const createCompanySchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  timezone: Joi.string().optional().allow("", null),
  locale: Joi.string().optional().allow("", null),
});

export const listCompaniesSchema = Joi.object({
  search: Joi.string().allow("").optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  order: Joi.string().valid("asc", "desc").insensitive().default("desc"),
  all: Joi.boolean()
    .truthy("1")
    .truthy("true")
    .falsy("0")
    .falsy("false")
    .default(false),
});
