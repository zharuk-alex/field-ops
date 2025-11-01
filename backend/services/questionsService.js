import { QUESTIONS_ALLOWED_SORT } from "#root/constants/index.js";
import { Question } from "#root/db/models/index.js";
import { Op } from "sequelize";
const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const createQuestion = async (payload) => {
  return await Question.create(payload);
};

export const getById = async (id) => {
  return Question.findByPk(id);
};

export const listQuestions = async ({
  companyId,
  status,
  page = 1,
  limit = 20,
  q,
}) => {
  const where = {};
  if (companyId) where.companyId = companyId;
  if (status) where.status = status;
  if (q) where.questionText = { [Op.iLike]: `%${q}%` };

  const offset = (page - 1) * limit;
  const { rows, count } = await Question.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    items: rows,
    meta: { page, limit, total: count, pages: Math.ceil(count / limit) },
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

export async function findQuestions({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
  search,
  companyId,
  debug = false,
}) {
  const pageN = Math.max(1, Number(page) || 1);
  const lim = Math.max(1, Number(limit) || 10);
  const offset = (pageN - 1) * lim;
  const orderDir =
    String(order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

  const sortKey = QUESTIONS_ALLOWED_SORT.includes(sortBy)
    ? camelToSnakeCase(sortBy)
    : "createdAt";

  const where = {};
  if (search && String(search).trim()) {
    where.questionText = { [Op.iLike]: `%${String(search).trim()}%` };
  }
  if (companyId) where.companyId = companyId;

  let orderClause = [[sortKey, orderDir]];

  try {
    if (debug)
      console.log(
        "findQuestions: where=",
        where,
        "order=",
        orderClause,
        "limit=",
        lim,
        "offset=",
        offset
      );

    const result = await Question.findAndCountAll({
      where,
      limit: lim,
      offset,
      order: orderClause,
      logging: debug ? console.log : false,
    });

    return {
      items: result.rows,
      meta: { total: result.count, page: pageN, limit: lim },
    };
  } catch (err) {
    console.error("findQuestions error", err);
    throw err;
  }
}
