import {
  sequelize,
  Audit,
  AuditQuestion,
  TemplateQuestion,
  Question,
  Company,
  Location,
  Template,
  User,
} from "../db/models/index.js";
import { Op } from "sequelize";

const SORT_MAP = {
  createdAt: ["createdAt"],
  updatedAt: ["updatedAt"],
  status: ["status"],
  scheduledAt: ["scheduledAt"],
  companyName: [{ model: Company, as: "company" }, "name"],
  locationName: [{ model: Location, as: "location" }, "name"],
  templateName: [{ model: Template, as: "template" }, "name"],
  assigneeName: [{ model: User, as: "assignee" }, "fullName"],
};

export async function createAudit(payload) {
  return sequelize.transaction(async (t) => {
    const audit = await Audit.create(
      {
        companyId: payload.companyId,
        locationId: payload.locationId,
        templateId: payload.templateId,
        assigneeId: payload.assigneeId ?? null,
        scheduledAt: payload.scheduledAt ?? null,
        dueAt: payload.dueAt ?? payload.dueDate ?? null,
        status: payload.status ?? "scheduled",
        meta: payload.meta ?? null,
      },
      { transaction: t }
    );

    const tplQuestions = await TemplateQuestion.findAll({
      where: { templateId: payload.templateId },
      include: [{ model: Question, as: "question" }],
      order: [
        ["order", "ASC"],
        ["createdAt", "ASC"],
      ],
      transaction: t,
    });

    if (tplQuestions.length) {
      const items = tplQuestions.map((tplq) => ({
        auditId: audit.id,
        templateQuestionId: tplq.id,
        questionId: tplq.questionId,
        order: tplq.order ?? 0,
        status: "pending",
        meta: tplq.meta ?? null,
      }));
      await AuditQuestion.bulkCreate(items, { transaction: t });
    }

    return audit;
  });
}

export async function findAudits({
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  order = "desc",
  companyId,
  locationId,
  assigneeId,
  status,
  q,
  search,
  from,
  to,
  all = false,
  debug = false,
  role,
  roleCompanyId,
}) {
  const orderDir =
    String(order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const sortCol = SORT_MAP[sortBy] || SORT_MAP.createdAt;

  const where = {};

  if (role === "manager") {
    where.companyId = roleCompanyId;
  } else if (companyId) {
    where.companyId = companyId;
  }

  if (locationId) where.locationId = locationId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status;

  if (from || to) {
    where.scheduledAt = {};
    if (from) where.scheduledAt[Op.gte] = new Date(from);
    if (to) where.scheduledAt[Op.lte] = new Date(to);
  }

  const term = (q ?? search ?? "").toString().trim();

  const include = [
    { model: Company, as: "company", attributes: ["id", "name"] },
    {
      model: Location,
      as: "location",
      attributes: ["id", "name", "address", "lat", "lng"],
    },
    { model: Template, as: "template", attributes: ["id", "name"] },
    { model: User, as: "assignee", attributes: ["id", "fullName", "email"] },
  ];

  if (term) {
    where[Op.or] = [
      { "$company.name$": { [Op.iLike]: `%${term}%` } },
      { "$location.name$": { [Op.iLike]: `%${term}%` } },
      { "$template.name$": { [Op.iLike]: `%${term}%` } },
    ];
  }

  const orderClause = [
    [...sortCol, orderDir],
    ["createdAt", "DESC"],
  ];

  if (all) {
    const rows = await Audit.findAll({
      where,
      include,
      order: orderClause,
      logging: debug ? console.log : false,
    });
    return {
      items: rows,
      meta: { total: rows.length, page: 1, limit: rows.length, pages: 1 },
    };
  }

  const pageN = Math.max(1, Number(page));
  const lim = Math.max(1, Number(limit));
  const offset = (pageN - 1) * lim;

  const result = await Audit.findAndCountAll({
    where,
    include,
    limit: lim,
    offset,
    order: orderClause,
    logging: debug ? console.log : false,
  });

  return {
    items: result.rows,
    meta: {
      total: result.count,
      page: pageN,
      limit: lim,
      pages: Math.ceil(result.count / lim),
    },
  };
}

export async function getAuditById(id) {
  return Audit.findByPk(id, {
    include: [
      { model: Company, as: "company", attributes: ["id", "name"] },
      {
        model: Location,
        as: "location",
        attributes: ["id", "name", "address", "lat", "lng"],
      },
      { model: Template, as: "template", attributes: ["id", "name"] },
      { model: User, as: "assignee", attributes: ["id", "fullName", "email"] },
      {
        model: AuditQuestion,
        as: "items",
        include: [
          {
            model: Question,
            as: "question",
            attributes: ["id", "type", "questionText"],
          },
        ],
      },
    ],
    order: [
      [{ model: AuditQuestion, as: "items" }, "order", "ASC"],
      [{ model: AuditQuestion, as: "items" }, "createdAt", "ASC"],
    ],
  });
}
