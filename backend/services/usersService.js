import { User } from "../db/models/index.js";
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

export const listUsers = async ({ offset, limit, filters = {} }) => {
  const where = {};
  if (filters.role) where.role = filters.role;
  if (filters.companyId) where.companyId = filters.companyId;
  return User.findAndCountAll({
    where,
    offset,
    limit,
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
};

export const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  return user;
};

export const updateUser = async (id, changes) => {
  if (changes.password) {
    changes.password = await bcrypt.hash(changes.password, 10);
  }
  await User.update(changes, { where: { id } });
  return getUserById(id);
};

export const deleteUser = async (id) => {
  return User.destroy({ where: { id } });
};
