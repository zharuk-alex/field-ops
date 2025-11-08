import { createAuditSchema, listAuditsSchema } from "../validators/audits.js";
import * as auditsService from "../services/auditsService.js";

export const createAudit = async (req, res, next) => {
  try {
    const { error, value } = createAuditSchema.validate(req.body, {
      convert: true,
    });
    if (error) return res.status(400).json({ message: error.message });

    if (req.user.role === "manager" && req.user.companyId !== value.companyId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const payload = { ...value, createdBy: req.user?.id ?? null };

    const audit = await auditsService.createAudit(payload);
    const full = await auditsService.getAuditById(audit.id);
    return res.status(201).json(full);
  } catch (e) {
    next(e);
  }
};

export const listAudits = async (req, res, next) => {
  try {
    const { error, value } = listAuditsSchema.validate(req.query, {
      convert: true,
    });
    if (error) return res.status(400).json({ message: error.message });

    const params = { ...value };
    if (req.user.role === "manager") {
      params.companyId = req.user.companyId;
    }

    const result = await auditsService.findAudits({
      ...params,
      role: req.user.role,
      roleCompanyId: req.user.companyId ?? null,
      debug: false,
    });
    return res.json(result);
  } catch (e) {
    next(e);
  }
};

export const getAudit = async (req, res, next) => {
  try {
    const audit = await auditsService.getAuditById(req.params.id);
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    if (req.user.role === "manager" && req.user.companyId !== audit.companyId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.json(audit);
  } catch (e) {
    next(e);
  }
};
