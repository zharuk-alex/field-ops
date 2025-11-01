import { LOCATIONS_ALLOWED_SORT as ALLOWED_SORT } from "#root/constants/index.js";
import Joi from "joi";

export const createLocationSchema = Joi.object({
  companyId: Joi.string().uuid().required(),
  name: Joi.string().min(1).required(),
  address: Joi.string().allow("", null).optional(),
  lat: Joi.number().precision(7).optional().allow(null),
  lng: Joi.number().precision(7).optional().allow(null),
  meta: Joi.object().optional().allow(null),
  status: Joi.string().valid("active", "inactive").default("active"),
});

export const updateLocationSchema = Joi.object({
  companyId: Joi.string().uuid().optional(),
  name: Joi.string().min(1).optional(),
  address: Joi.string().allow("", null).optional(),
  lat: Joi.number().precision(7).optional().allow(null),
  lng: Joi.number().precision(7).optional().allow(null),
  meta: Joi.object().optional().allow(null),
  status: Joi.string().valid("active", "inactive").optional(),
});

export const listLocationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
  sortBy: Joi.string()
    .valid(...ALLOWED_SORT)
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").insensitive().default("desc"),
  search: Joi.string().allow("", null).optional(),
  companyId: Joi.string().uuid().optional().allow(null, ""),
});
