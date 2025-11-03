import HttpError from "../helpers/HttpError.js";
import * as questionsService from "../services/questionsService.js";

export const listQuestions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      search,
      companyId,
      all,
    } = req.query;

    if (all && (!req.user || req.user.role !== "admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await questionsService.findQuestions({
      page,
      limit,
      sortBy,
      order,
      search,
      companyId,
      debug: true,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

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
    companyId: companyId === "" ? null : companyId,
    type,
    choices,
    status,
    createdBy: req.user.id,
  });

  res.status(201).json(question);
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

  payload.companyId = payload.companyId === "" ? null : payload.companyId;

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
