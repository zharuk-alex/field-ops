import { AUDITS_ALLOWED_SORT, AUDITS_STATUS } from "#root/constants/index.js";
import Joi from "joi";

export const createAuditSchema = Joi.object({
  companyId: Joi.string().uuid().required(),
  templateId: Joi.string().uuid().required(),
  locationId: Joi.string().uuid().allow(null),
  assigneeId: Joi.string().uuid().allow(null),
  startsAt: Joi.date().iso().allow(null),
  endsAt: Joi.date().iso().allow(null),
  dueAt: Joi.date().iso().allow(null),
  dueDate: Joi.date().iso().allow(null),
  status: Joi.string()
    .valid(...AUDITS_STATUS)
    .default("draft"),
  meta: Joi.object().unknown(true).allow(null),
});

export const listAuditsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid(...AUDITS_ALLOWED_SORT)
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").insensitive().default("desc"),
  companyId: Joi.string().uuid().optional(),
  locationId: Joi.string().uuid().optional(),
  assigneeId: Joi.string().uuid().optional(),
  status: Joi.string()
    .valid(...AUDITS_STATUS)
    .optional(),
  q: Joi.string().allow("").optional(),
  search: Joi.string().allow("").optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  // all: Joi.boolean().default(false),
});
