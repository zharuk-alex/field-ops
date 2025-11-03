import * as usersService from "../services/usersService.js";
import { getPagination, getPagingData } from "../helpers/pagination.js";
import {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
} from "../validators/users.js";

export const listUsers = async (req, res) => {
  const { error, value } = listUsersSchema.validate(req.query);
  if (error) return res.status(400).json({ message: error.message });

  const searchTerm = value.q ?? value.search ?? "";

  if (req.user.role === "manager") {
    value.companyId = req.user.companyId;
  }

  const { offset, limit } = getPagination(value);
  const result = await usersService.listUsers({
    offset,
    limit,
    filters: { role: value.role, companyId: value.companyId },
    sortBy: value.sortBy,
    order: value.order,
    q: searchTerm,
  });

  return res.json(getPagingData(result, value.page, value.limit));
};

export const createUser = async (req, res) => {
  const { error, value } = createUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  if (req.user.role === "manager") {
    value.companyId = req.user.companyId;
    if (value.role === "admin") value.role = "manager";
  }

  const created = await usersService.createUser(value);
  return res.status(201).json(created);
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  const user = await usersService.getUser(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (req.user.role === "manager" && req.user.companyId !== user.companyId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (req.user.role === "auditor" && req.user.id !== user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json(user);
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const target = await usersService.getUser(id);
  if (!target) return res.status(404).json({ message: "User not found" });

  if (req.user.role === "manager" && req.user.companyId !== target.companyId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.user.role === "manager") {
    if (value.role === "admin") delete value.role;
    if (value.companyId && value.companyId !== req.user.companyId)
      delete value.companyId;
  }

  if (req.user.role === "auditor" && req.user.id !== id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (req.user.role === "auditor") {
    delete value.role;
    delete value.status;
    delete value.companyId;
  }

  const updated = await usersService.updateUser(id, value);
  return res.json(updated);
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;

  const target = await usersService.getUser(id);
  if (!target) return res.status(404).json({ message: "User not found" });

  if (req.user.role === "manager" && req.user.companyId !== target.companyId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (req.user.role === "auditor" && req.user.id !== id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await usersService.deleteUser(id);
  return res.status(204).send();
};
