import HttpError from "../helpers/HttpError.js";
import {
  createTemplate as svcCreate,
  findTemplates as svcFind,
  getTemplateById as svcGetById,
  updateTemplate as svcUpdate,
  softDeleteTemplate as svcDelete,
} from "../services/templatesService.js";

function canReadTemplate(user, template) {
  if (user.role === "admin") return true;
  if (!template.companyId) return true;
  return user.companyId && template.companyId === user.companyId;
}

export const createTemplate = async (req, res) => {
  const {
    name,
    description = null,
    status = "active",
    companyId = null,
    questions = [],
    locations = [],
  } = req.body;

  if (!name || !String(name).trim()) throw HttpError(400, "name is required");

  const effectiveCompanyId =
    req.user?.role === "admin" ? companyId : req.user?.companyId ?? null;

  const created = await svcCreate({
    name: String(name).trim(),
    description,
    status,
    companyId: effectiveCompanyId,
    createdBy: req.user?.id ?? null,
    questions,
    locations,
  });

  return res.status(201).json(created);
};

export const listTemplates = async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const sortBy = String(req.query.sortBy || "createdAt");
  const order = String(req.query.order || "desc");
  const search = req.query.search || undefined;

  let companyId = null;
  if (req.user.role === "admin") {
    if (req.query.companyId) companyId = req.query.companyId;
  } else {
    companyId = req.user.companyId || null;
  }

  const result = await svcFind({
    page,
    limit,
    companyId,
    sortBy,
    order,
    q: search,
  });

  return res.json(result);
};

export const getTemplate = async (req, res) => {
  const { id } = req.params;
  const template = await svcGetById(id);
  if (!template) throw HttpError(404, "Template not found");
  if (!canReadTemplate(req.user, template)) throw HttpError(403, "Forbidden");
  return res.json(template);
};

export const updateTemplate = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    status,
    companyId: bodyCompanyId,
    questions,
    locations,
  } = req.body;

  const existing = await svcGetById(id);
  if (!existing) throw HttpError(404, "Template not found");

  if (req.user.role !== "admin") {
    if (!req.user.companyId || existing.companyId !== req.user.companyId) {
      throw HttpError(403, "Forbidden");
    }
  }

  const payload = {
    name,
    description,
    status,
    companyId: req.user.role === "admin" ? bodyCompanyId : existing.companyId,
  };

  if (questions !== undefined) {
    if (!Array.isArray(questions))
      throw HttpError(400, "questions must be an array");
    payload.questions = questions;
  }
  if (locations !== undefined) {
    if (!Array.isArray(locations))
      throw HttpError(400, "locations must be an array");
    payload.locations = locations;
  }

  const updated = await svcUpdate(id, payload);
  return res.json(updated);
};

export const deleteTemplate = async (req, res) => {
  const { id } = req.params;
  const existing = await svcGetById(id);
  if (!existing) throw HttpError(404, "Template not found");

  if (req.user.role !== "admin") {
    if (!req.user.companyId || existing.companyId !== req.user.companyId) {
      throw HttpError(403, "Forbidden");
    }
  }

  await svcDelete(id);
  return res.status(204).send();
};
