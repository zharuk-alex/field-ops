import { QUESTIONS_ALLOWED_SORT } from "#root/constants/index.js";
import { Question, Company } from "#root/db/models/index.js";
import { Op } from "sequelize";
const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const createQuestion = async (payload) => {
  return await Question.create(payload);
};

export const getById = async (id) => {
  return Question.findByPk(id);
};

export const findQuestions = async ({
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  order = "desc",
  q,
  companyId,
  status,
  debug = false,
}) => {
  const pageN = Math.max(1, Number(page));
  const lim = Math.max(1, Number(limit));
  const offset = (pageN - 1) * lim;

  const orderDir =
    String(order || "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
  const sort = QUESTIONS_ALLOWED_SORT.includes(sortBy) ? sortBy : "createdAt";

  const where = {};
  if (companyId) where.companyId = companyId;
  if (status) where.status = status;
  if (q && String(q).trim())
    where.questionText = { [Op.iLike]: `%${String(q).trim()}%` };

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

  const result = await Question.findAndCountAll({
    where,
    include,
    limit: lim,
    offset,
    order: orderClause,
    logging: debug ? console.log : false,
  });

  console.log("findAndCountAll::result", result);

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
};

export const updateQuestion = async (id, payload) => {
  const q = await Question.findByPk(id);
  if (!q) return null;
  await q.update(payload);
  return q;
};

export const setInactive = async (id) => {
  const q = await Question.findByPk(id);
  if (!q) return null;
  q.status = "inactive";
  await q.save();
  return q;
};
