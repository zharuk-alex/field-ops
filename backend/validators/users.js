import Joi from "joi";
import { USERS_ALLOWED_SORT } from "#root/constants/index.js";

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "manager", "auditor").optional(),
  companyId: Joi.string().uuid().optional().allow(null),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid("admin", "manager", "auditor").optional(),
  companyId: Joi.string().uuid().optional().allow(null),
});

export const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
  role: Joi.string().valid("admin", "manager", "auditor").optional(),
  companyId: Joi.string().uuid().optional(),
  q: Joi.string().allow("").optional(),
  search: Joi.string().allow("").optional(),
  sortBy: Joi.string()
    .valid(...USERS_ALLOWED_SORT)
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").insensitive().default("desc"),
});
