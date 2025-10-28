import { Question } from "../db/models/index.js"; // адаптуй шлях під твій index.js
import { Op } from "sequelize";

export const createQuestion = async (payload) => {
  const question = await Question.create(payload);
  return question;
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
