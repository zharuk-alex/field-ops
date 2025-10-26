import { Company } from "../db/models/index.js";

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
