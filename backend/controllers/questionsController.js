import HttpError from "../helpers/HttpError.js";
import * as questionsService from "../services/questionsService.js";

export const createQuestion = async (req, res) => {
  const {
    questionText,
    companyId: bodyCompanyId,
    type,
    choices,
    status,
  } = req.body;

  const companyId =
    req.user.role === "manager" ? req.user.companyId : bodyCompanyId ?? null;
  if (
    req.user.role === "manager" &&
    companyId &&
    req.user.companyId !== companyId
  ) {
    throw HttpError(403, "Forbidden");
  }

  const question = await questionsService.createQuestion({
    questionText,
    companyId,
    type,
    choices,
    status,
    createdBy: req.user.id,
  });

  res.status(201).json(question);
};

export const listQuestions = async (req, res) => {
  const { companyId: qCompanyId, status, page = 1, limit = 20, q } = req.query;

  const companyId =
    req.user.role === "manager" ? req.user.companyId : qCompanyId;

  const result = await questionsService.listQuestions({
    companyId,
    status,
    page,
    limit,
    q,
  });
  res.json(result);
};

export const getQuestion = async (req, res) => {
  const { id } = req.params;
  const question = await questionsService.getById(id);
  if (!question) throw HttpError(404, "Question not found");

  if (
    req.user.role === "manager" &&
    question.companyId !== req.user.companyId
  ) {
    throw HttpError(403, "Forbidden");
  }

  res.json(question);
};

export const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const question = await questionsService.getById(id);
  if (!question) throw HttpError(404, "Question not found");

  if (req.user.role === "manager") {
    const companyId = payload.companyId ?? question.companyId;
    if (companyId !== req.user.companyId) throw HttpError(403, "Forbidden");
  }

  const updated = await questionsService.updateQuestion(id, payload);
  res.json(updated);
};

export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  const question = await questionsService.getById(id);
  if (!question) throw HttpError(404, "Question not found");

  if (
    req.user.role === "manager" &&
    question.companyId !== req.user.companyId
  ) {
    throw HttpError(403, "Forbidden");
  }

  await questionsService.setInactive(id);
  res.status(204).send();
};
