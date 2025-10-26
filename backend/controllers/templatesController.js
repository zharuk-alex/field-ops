import sequelize from "../db/Sequelize.js";
import HttpError from "../helpers/HttpError.js";
import {
  Template,
  TemplateQuestion,
  Company,
  User,
} from "../db/models/index.js";
import { Op } from "sequelize";

function resolveCompanyIdForWrite(reqBodyCompanyId, reqUser) {
  if (reqUser.role === "admin") {
    return reqBodyCompanyId || reqUser.companyId || null;
  }
  if (reqUser.role === "manager") {
    return reqUser.companyId;
  }
  return null;
}

function ensureCanReadTemplate(user, template) {
  if (user.role === "admin") {
    return true;
  }
  if (!template.companyId) {
    return true;
  }
  return user.companyId && template.companyId === user.companyId;
}

export const createTemplate = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, companyId: bodyCompanyId, questions } = req.body;
    const companyId = resolveCompanyIdForWrite(bodyCompanyId, req.user);

    if (!companyId && req.user.role !== "admin") {
      throw HttpError(403, "Forbidden");
    }

    if (companyId) {
      const c = await Company.findByPk(companyId);
      if (!c) throw HttpError(400, "companyId invalid");
    }

    const template = await Template.create(
      { name, description, companyId },
      { transaction: t }
    );

    const prepared = questions.map((q, i) => ({
      templateId: template.id,
      questionText: q.questionText,
      type: q.type,
      choices: Array.isArray(q.choices) ? q.choices : [],
      required: !!q.required,
      order: typeof q.order === "number" ? q.order : i,
    }));

    await TemplateQuestion.bulkCreate(prepared, { transaction: t });

    await t.commit();

    const withQuestions = await Template.findByPk(template.id, {
      include: [
        { model: TemplateQuestion, as: "questions", order: [["order", "ASC"]] },
      ],
    });

    res.status(201).json(withQuestions);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const listTemplates = async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const offset = (page - 1) * limit;

  let where = {};

  const qCompanyId = req.query.companyId;

  if (req.user.role === "admin") {
    if (qCompanyId) where.companyId = qCompanyId;
  } else {
    where.companyId = req.user.companyId || null;
  }

  const { rows, count } = await Template.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    offset,
    limit,
    include: [{ model: TemplateQuestion, as: "questions" }],
  });

  res.json({
    page,
    limit,
    total: count,
    items: rows,
  });
};

export const getTemplate = async (req, res) => {
  const { id } = req.params;

  const template = await Template.findByPk(id, {
    include: [
      { model: TemplateQuestion, as: "questions", order: [["order", "ASC"]] },
    ],
  });
  if (!template) throw HttpError(404, "Template not found");

  if (!ensureCanReadTemplate(req.user, template)) {
    throw HttpError(403, "Forbidden");
  }

  res.json(template);
};

export const updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, description, companyId: bodyCompanyId, questions } = req.body;

  const template = await Template.findByPk(id);
  if (!template) throw HttpError(404, "Template not found");

  if (req.user.role !== "admin") {
    if (!req.user.companyId || template.companyId !== req.user.companyId) {
      throw HttpError(403, "Forbidden");
    }
  }

  const t = await sequelize.transaction();
  try {
    await template.update(
      {
        name: name ?? template.name,
        description: description ?? template.description,
        companyId:
          req.user.role === "admin"
            ? bodyCompanyId ?? template.companyId
            : template.companyId,
      },
      { transaction: t }
    );

    await TemplateQuestion.destroy({
      where: { templateId: template.id },
      transaction: t,
    });

    const prepared = questions.map((q, i) => ({
      templateId: template.id,
      questionText: q.questionText,
      type: q.type,
      choices: Array.isArray(q.choices) ? q.choices : [],
      required: !!q.required,
      order: typeof q.order === "number" ? q.order : i,
    }));

    await TemplateQuestion.bulkCreate(prepared, { transaction: t });

    await t.commit();

    const withQuestions = await Template.findByPk(template.id, {
      include: [
        { model: TemplateQuestion, as: "questions", order: [["order", "ASC"]] },
      ],
    });

    res.json(withQuestions);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const deleteTemplate = async (req, res) => {
  const { id } = req.params;
  const template = await Template.findByPk(id);
  if (!template) throw HttpError(404, "Template not found");

  if (req.user.role !== "admin") {
    if (!req.user.companyId || template.companyId !== req.user.companyId) {
      throw HttpError(403, "Forbidden");
    }
  }

  await template.update({ archived: true });

  res.status(204).send({ success: true });
};
