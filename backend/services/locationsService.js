import { LOCATIONS_ALLOWED_SORT as ALLOWED_SORT } from "#root/constants/index.js";
import { Location, Company } from "#root/db/models/index.js";
import { Op } from "sequelize";

export async function createLocation(payload) {
  const item = await Location.create(payload);
  return item;
}

export async function getById(id) {
  return Location.findByPk(id);
}

export async function findLocations({
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

  const result = await Location.findAndCountAll({
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

export async function updateLocation(id, payload) {
  const item = await Location.findByPk(id);
  if (!item) return null;
  await item.update(payload);
  return item;
}

export async function setInactive(id) {
  const item = await Location.findByPk(id);
  if (!item) return null;
  await item.update({ status: "inactive" });
  return item;
}

export async function deleteLocation(id) {
  const item = await Location.findByPk(id);
  if (!item) return null;
  await item.destroy();
  return true;
}
