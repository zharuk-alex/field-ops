import {
  sequelize,
  Audit,
  AuditQuestion,
  Question,
  Company,
  Location,
  Template,
  User,
  Answer,
  Photo,
} from "../db/models/index.js";
import { Op } from "sequelize";

const SORT_MAP = {
  createdAt: ["createdAt"],
  updatedAt: ["updatedAt"],
  status: ["status"],
  scheduledAt: ["startsAt"],
  startsAt: ["startsAt"],
  endsAt: ["endsAt"],
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
        locationId: payload.locationId ?? null,
        templateId: payload.templateId ?? null,
        assigneeId: payload.assigneeId ?? null,
        startsAt: payload.startsAt ?? payload.scheduledAt ?? null,
        endsAt: payload.endsAt ?? payload.dueAt ?? payload.dueDate ?? null,
        status: payload.status ?? "draft",
        meta: payload.meta ?? null,
      },
      { transaction: t }
    );

    const template = payload.templateId
      ? await Template.findByPk(payload.templateId, { transaction: t })
      : null;

    const qIds = Array.isArray(template?.questionsIds)
      ? template.questionsIds.filter(Boolean)
      : [];

    if (qIds.length) {
      const questions = await Question.findAll({
        where: { id: { [Op.in]: qIds }, status: "active" },
        transaction: t,
      });

      const byId = new Map(questions.map((q) => [q.id, q]));

      const items = qIds
        .map((qid, idx) => {
          const q = byId.get(qid);
          if (!q) return null;
          return {
            auditId: audit.id,
            templateQuestionId: null,
            questionId: q.id,
            questionText: q.questionText,
            type: q.type,
            choices: q.choices ?? null,
            order: idx,
            required: false,
          };
        })
        .filter(Boolean);

      if (items.length) {
        await AuditQuestion.bulkCreate(items, { transaction: t });
      }
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
    where.startsAt = {};
    if (from) where.startsAt[Op.gte] = new Date(from);
    if (to) where.startsAt[Op.lte] = new Date(to);
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
    {
      model: User,
      as: "assignee",
      attributes: ["id", "firstName", "lastName", "email"],
    },
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
      {
        model: User,
        as: "assignee",
        attributes: ["id", "firstName", "lastName", "email"],
      },
      {
        model: AuditQuestion,
        as: "items",
        include: [
          {
            model: Question,
            as: "question",
            attributes: ["id", "type", "questionText"],
          },
          {
            model: Answer,
            as: "answers",
            attributes: ["id", "userId", "value", "comment", "createdAt"],
            include: [
              {
                model: Photo,
                as: "photos",
                attributes: [
                  "id",
                  "url",
                  "thumbnailUrl",
                  "format",
                  "width",
                  "height",
                  "bytes",
                  "createdAt",
                ],
              },
            ],
          },
        ],
      },
      {
        model: Photo,
        as: "photos",
        attributes: [
          "id",
          "url",
          "thumbnailUrl",
          "format",
          "width",
          "height",
          "bytes",
          "answerId",
          "createdAt",
        ],
      },
    ],
    order: [
      [{ model: AuditQuestion, as: "items" }, "order", "ASC"],
      [{ model: AuditQuestion, as: "items" }, "createdAt", "ASC"],
      [{ model: Photo, as: "photos" }, "createdAt", "ASC"],
    ],
  });
}
