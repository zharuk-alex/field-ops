import HttpError from "../helpers/HttpError.js";
import {
  getAvailableTemplates,
  saveAudit as svcSaveAudit,
} from "../services/pwaService.js";

export const getTemplates = async (req, res) => {
  const userId = req.user?.id;
  const companyId = req.user?.companyId;
  const userRole = req.user?.role;

  if (!userId) {
    throw HttpError(401, "User not authenticated");
  }

  if (!companyId && userRole !== "admin") {
    throw HttpError(
      403,
      "User does not belong to any company. Please contact administrator."
    );
  }

  const templates = await getAvailableTemplates(userId, companyId);
  return res.json({ templates });
};

export const submitAudit = async (req, res) => {
  const userId = req.user?.id;
  const companyId = req.user?.companyId;
  const userRole = req.user?.role;
  const {
    templateId,
    locationId,
    answers,
    startedAt,
    completedAt,
    localId,
    startLocation,
    endLocation,
  } = req.body;

  if (!userId) {
    throw HttpError(401, "User not authenticated");
  }

  if (!templateId) {
    throw HttpError(400, "templateId is required");
  }

  if (!answers || !Array.isArray(answers)) {
    throw HttpError(400, "answers array is required");
  }

  if (!companyId && userRole !== "admin") {
    throw HttpError(
      403,
      "User does not belong to any company. Please contact administrator."
    );
  }

  const audit = await svcSaveAudit({
    templateId,
    locationId,
    answers,
    startedAt,
    completedAt,
    localId,
    userId,
    companyId,
    userRole,
    startLocation,
    endLocation,
  });

  return res.status(201).json(audit);
};
