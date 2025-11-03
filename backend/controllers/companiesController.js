import * as companiesService from "../services/companiesService.js";
import { listCompaniesSchema } from "../validators/companies.js";
import HttpError from "../helpers/HttpError.js";

export const createCompany = async (req, res, next) => {
  try {
    const { name, description, meta } = req.body;

    if (!name || !name.trim()) {
      throw HttpError(400, "name is required");
    }

    const company = await companiesService.createCompany({
      name: name.trim(),
      description: description || null,
      meta: meta || null,
    });

    return res.status(201).json(company);
  } catch (err) {
    next(err);
  }
};

export const getCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await companiesService.getCompanyById(id);

    if (!company) {
      throw HttpError(404, "Company not found");
    }

    return res.json(company);
  } catch (err) {
    next(err);
  }
};

export const listCompanies = async (req, res, next) => {
  try {
    const { error, value } = listCompaniesSchema.validate(req.query, {
      convert: true,
    });
    if (error) return res.status(400).json({ message: error.message });

    const { page, limit, sortBy, order, search, all } = value;

    let companyId = null;
    if (req.user && req.user.role === "manager") {
      companyId = req.user.companyId;
    } else if (req.query.companyId) {
      companyId = req.query.companyId;
    }

    if (all && (!req.user || req.user.role !== "admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await companiesService.findCompanies({
      page,
      limit,
      sortBy,
      order,
      search,
      companyId,
      all,
      debug: false,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = {};
    if (typeof req.body.name !== "undefined") {
      if (!req.body.name || !String(req.body.name).trim()) {
        throw HttpError(400, "name is required");
      }
      payload.name = String(req.body.name).trim();
    }
    if (typeof req.body.description !== "undefined") {
      payload.description = req.body.description || null;
    }
    if (typeof req.body.timezone !== "undefined") {
      payload.timezone = req.body.timezone || null;
    }
    if (typeof req.body.locale !== "undefined") {
      payload.locale = req.body.locale || null;
    }
    if (typeof req.body.meta !== "undefined") {
      payload.meta = req.body.meta || null;
    }
    if (typeof req.body.status !== "undefined") {
      payload.status = req.body.status;
    }

    const updated = await companiesService.updateCompany(id, payload);
    if (!updated) {
      throw HttpError(404, "Company not found");
    }

    return res.json(updated);
  } catch (err) {
    next(err);
  }
};
