import { TEMPLATES_ALLOWED_SORT as ALLOWED_SORT } from "#root/constants/index.js";
import {
  Template,
  Company,
  Question,
  Location,
} from "#root/db/models/index.js";
import { Op } from "sequelize";

export async function createTemplate(payload) {
  const item = await Template.create({
    name: payload.name,
    description: payload.description ?? null,
    status: payload.status ?? "active",
    companyId: payload.companyId ?? null,
    createdBy: payload.createdBy ?? null,
    questionsIds: Array.isArray(payload.questions) ? payload.questions : [],
    locationIds: Array.isArray(payload.locations) ? payload.locations : [],
  });
  return item;
}

export async function getTemplateById(id) {
  const template = await Template.findByPk(id, {
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name"],
        required: false,
      },
    ],
  });

  if (!template) return null;

  const plain = template.get({ plain: true });

  if (plain.questionsIds && plain.questionsIds.length > 0) {
    const questions = await Question.findAll({
      where: {
        id: { [Op.in]: plain.questionsIds },
      },
      attributes: ["id", "questionText", "type", "choices", "status"],
      order: [["createdAt", "ASC"]],
    });

    plain.questions = plain.questionsIds
      .map((qId) => questions.find((q) => q.id === qId))
      .filter(Boolean);
  } else {
    plain.questions = [];
  }

  if (plain.locationIds && plain.locationIds.length > 0) {
    const locations = await Location.findAll({
      where: {
        id: { [Op.in]: plain.locationIds },
      },
      attributes: ["id", "name", "address", "lat", "lng", "status"],
      order: [["createdAt", "ASC"]],
    });

    plain.locations = plain.locationIds
      .map((lId) => locations.find((l) => l.id === lId))
      .filter(Boolean);
  } else {
    plain.locations = [];
  }

  return plain;
}

export async function findTemplates({
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  order = "desc",
  q,
  companyId,
  debug = false,
}) {
  const pageN = Math.max(1, Number(page));
  const lim = Math.max(1, Number(limit));
  const offset = (pageN - 1) * lim;

  const orderDir =
    String(order || "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
  const sort = ALLOWED_SORT.includes(sortBy) ? sortBy : "createdAt";

  const where = {};
  if (companyId) where.companyId = companyId;
  if (q && String(q).trim())
    where.name = { [Op.iLike]: `%${String(q).trim()}%` };

  const include = [
    {
      model: Company,
      as: "company",
      attributes: ["id", "name"],
      required: false,
    },
  ];

  let orderClause;
  if (sort === "companyName") {
    orderClause = [
      [{ model: Company, as: "company" }, "name", orderDir],
      ["createdAt", "DESC"],
    ];
  } else {
    orderClause = [
      [sort, orderDir],
      ["createdAt", "DESC"],
    ];
  }

  const result = await Template.findAndCountAll({
    where,
    include,
    limit: lim,
    offset,
    order: orderClause,
    logging: debug ? console.log : false,
  });

  const items = result.rows.map((r) => {
    const plain = r.get ? r.get({ plain: true }) : r;
    const companyObj = plain.company ?? plain.Company ?? null;
    plain.companyName = companyObj?.name ?? null;
    return plain;
  });

  return {
    items,
    meta: {
      total: result.count,
      page: pageN,
      limit: lim,
      pages: Math.ceil(result.count / lim),
    },
  };
}

export async function updateTemplate(id, payload) {
  const item = await Template.findByPk(id);
  if (!item) return null;

  const changes = {};
  if (payload.name !== undefined) changes.name = payload.name;
  if (payload.description !== undefined)
    changes.description = payload.description;
  if (payload.status !== undefined) changes.status = payload.status;
  if (payload.companyId !== undefined) changes.companyId = payload.companyId;
  if (payload.questions !== undefined)
    changes.questionsIds = Array.isArray(payload.questions)
      ? payload.questions
      : [];
  if (payload.locations !== undefined)
    changes.locationIds = Array.isArray(payload.locations)
      ? payload.locations
      : [];

  await item.update(changes);
  return item;
}

export async function setInactive(id) {
  const item = await Template.findByPk(id);
  if (!item) return null;
  await item.update({ status: "inactive" });
  return item;
}

export async function deleteTemplate(id) {
  const item = await Template.findByPk(id);
  if (!item) return null;
  await item.destroy();
  return true;
}

export async function softDeleteTemplate(id) {
  const item = await Template.findByPk(id);
  if (!item) return false;
  await item.update({ archived: true });
  return true;
}
