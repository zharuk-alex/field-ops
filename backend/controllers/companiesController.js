import * as companiesService from "../services/companiesService.js";
import { getPagination, getPagingData } from "../helpers/pagination.js";
import {
  createCompanySchema,
  listCompaniesSchema,
} from "../validators/companies.js";

export const createCompany = async (req, res) => {
  const { error, value } = createCompanySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const company = await companiesService.createCompany(value);
  return res.status(201).json(company);
};

export const listCompanies = async (req, res) => {
  const { error, value } = listCompaniesSchema.validate(req.query);
  if (error) return res.status(400).json({ message: error.message });

  const { offset, limit, page } = { ...getPagination(value), page: value.page };
  const result = await companiesService.listCompanies({ offset, limit });
  return res.json(getPagingData(result, value.page, value.limit));
};

export const getCompany = async (req, res) => {
  const id = req.params.id;
  const company = await companiesService.getCompanyById(id);
  if (!company) return res.status(404).json({ message: "Company not found" });

  if (req.user.role === "manager" && req.user.companyId !== company.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json(company);
};
