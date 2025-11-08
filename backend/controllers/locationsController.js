import * as locationsService from "../services/locationsService.js";
import {
  createLocationSchema,
  updateLocationSchema,
  listLocationsQuerySchema,
} from "../validators/locations.js";
import HttpError from "../helpers/HttpError.js";

export const createLocation = async (req, res, next) => {
  try {
    const { error, value } = createLocationSchema.validate(req.body);
    if (error) return next(HttpError(400, error.message));

    const created = await locationsService.createLocation(value);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const listLocations = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      search,
      companyId,
      all,
    } = req.query;
    const { error, value } = listLocationsQuerySchema.validate(req.query);
    if (error) return next(HttpError(400, error.message));

    if (value.companyId === "") delete value.companyId;

    const result = await locationsService.findLocations({
      page,
      limit,
      sortBy,
      order,
      q: search,
      companyId,
      all,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await locationsService.getById(id);
    if (!item) return next(HttpError(404, "Location not found"));
    return res.json(item);
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateLocationSchema.validate(req.body);
    if (error) return next(HttpError(400, error.message));

    const updated = await locationsService.updateLocation(id, value);
    if (!updated) return next(HttpError(404, "Location not found"));
    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await locationsService.setInactive(id);
    if (!updated) return next(HttpError(404, "Location not found"));
    return res.json({ message: "Location set to inactive" });
  } catch (err) {
    next(err);
  }
};
