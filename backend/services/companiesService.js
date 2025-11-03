import { COMPANY_ALLOWED_SORT as ALLOWED_SORT } from "#root/constants/index.js";
import { Company } from "../db/models/index.js";
import { Op } from "sequelize";

export const createCompany = async (payload) => {
  const company = await Company.create(payload);
  return company;
};

export const listCompanies = async ({ offset, limit }) => {
  return Company.findAndCountAll({
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });
};

export const getCompanyById = async (id) => {
  return Company.findByPk(id);
};

export async function findCompanies({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
  search,
  companyId,
  all = false,
  debug = false,
}) {
  const pageN = Math.max(1, Number(page));
  const lim = Math.max(1, Number(limit));
  const offset = (pageN - 1) * lim;

  const orderDir =
    String(order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const sort = ALLOWED_SORT.includes(sortBy) ? sortBy : "createdAt";

  const where = {};
  if (search && String(search).trim()) {
    where.name = { [Op.iLike]: `%${String(search).trim()}%` };
  }
  if (companyId) where.id = companyId;

  const orderClause = [
    [sort, orderDir],
    ["createdAt", "DESC"],
  ];

  if (all) {
    const rows = await Company.findAll({
      where,
      order: orderClause,
      logging: debug ? console.log : false,
    });

    return {
      items: rows,
      meta: {
        total: rows.length,
        page: 1,
        limit: rows.length,
        pages: rows.length > 0 ? 1 : 0,
      },
    };
  }

  const result = await Company.findAndCountAll({
    where,
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

export const updateCompany = async (id, payload) => {
  const item = await Company.findByPk(id);
  if (!item) return null;
  await item.update(payload);
  return item;
};
