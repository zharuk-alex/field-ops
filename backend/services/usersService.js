import { USERS_ALLOWED_SORT as ALLOWED_SORT } from "#root/constants/index.js";
import { User, Company } from "../db/models/index.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

export const createUser = async ({
  email,
  password,
  role = "auditor",
  companyId = null,
}) => {
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, role, companyId });
  const { password: _p, ...rest } = user.toJSON();
  return rest;
};

export const listUsers = async ({
  offset,
  limit,
  filters = {},
  sortBy = "createdAt",
  order = "desc",
  q,
  debug = false,
}) => {
  const dir = String(order || "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
  const sort =
    Array.isArray(ALLOWED_SORT) && ALLOWED_SORT.includes(sortBy)
      ? sortBy
      : "createdAt";

  const where = {};
  if (filters.role) where.role = filters.role;
  if (filters.companyId) where.companyId = filters.companyId;
  if (q && String(q).trim()) {
    const s = `%${String(q).trim()}%`;
    where[Op.or] = [
      { email: { [Op.iLike]: s } },
      { firstName: { [Op.iLike]: s } },
      { lastName: { [Op.iLike]: s } },
    ];
  }

  const include = [
    {
      model: Company,
      as: "company",
      attributes: ["id", "name"],
      required: false,
    },
  ];

  const orderClause =
    sort === "companyName"
      ? [
          [{ model: Company, as: "company" }, "name", dir],
          ["createdAt", "DESC"],
        ]
      : [
          [sort, dir],
          ["createdAt", "DESC"],
        ];

  return User.findAndCountAll({
    where,
    include,
    offset,
    limit,
    attributes: { exclude: ["password"] },
    order: orderClause,
    logging: debug ? console.log : false,
  });
};

export const getUser = async (id) => {
  return User.findByPk(id, {
    attributes: { exclude: ["password"] },
    include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
  });
};

export const updateUser = async (id, changes) => {
  if (changes.password) {
    changes.password = await bcrypt.hash(changes.password, 10);
  }
  await User.update(changes, { where: { id } });
  return getUser(id);
};

export const deleteUser = async (id) => {
  return User.destroy({ where: { id } });
};
