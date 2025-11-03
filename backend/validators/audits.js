import Joi from "joi";

export const createAuditSchema = Joi.object({
  companyId: Joi.string().uuid().required(),
  locationId: Joi.string().uuid().required(),
  templateId: Joi.string().uuid().required(),
  assigneeId: Joi.string().uuid().required(),
  dueDate: Joi.date().iso().optional().allow(null),
});

export const listAuditsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "dueDate", "status")
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").insensitive().default("desc"),
  companyId: Joi.string().uuid().optional(),
  locationId: Joi.string().uuid().optional(),
  assigneeId: Joi.string().uuid().optional(),
  status: Joi.string()
    .valid("new", "in_progress", "done", "cancelled")
    .optional(),
  q: Joi.string().allow("").optional(),
});
