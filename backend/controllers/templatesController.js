import sequelize from "../db/Sequelize.js";
import HttpError from "../helpers/HttpError.js";
import { Template, TemplateQuestion, Question } from "../db/models/index.js";

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
  const {
    name,
    description = null,
    companyId = null,
    questions = [],
  } = req.body;

  if (!name) throw HttpError(400, "name is required");

  const templateCompanyId =
    req.user?.role === "admin" ? companyId : req.user?.companyId;

  const t = await sequelize.transaction();
  try {
    const template = await Template.create(
      {
        name,
        description,
        companyId: templateCompanyId,
        createdBy: req.user?.id ?? null,
      },
      { transaction: t }
    );

    const tqRows = [];

    for (let i = 0; i < (questions || []).length; i++) {
      const q = questions[i];

      if (q.questionId) {
        const master = await Question.findOne({
          where: { id: q.questionId, status: "active" },
          transaction: t,
        });
        if (!master) {
          await t.rollback();
          throw HttpError(
            400,
            `Question not found or inactive: ${q.questionId}`
          );
        }

        if (
          master.companyId &&
          templateCompanyId &&
          master.companyId !== templateCompanyId &&
          req.user?.role !== "admin"
        ) {
          await t.rollback();
          throw HttpError(403, "Cannot attach question from different company");
        }

        tqRows.push({
          templateId: template.id,
          questionId: master.id,
          questionText: master.questionText,
          type: master.type,
          choices: master.choices,
          required: !!q.required,
          order: typeof q.order === "number" ? q.order : i,
        });
      } else if (q.questionText) {
        const newQ = await Question.create(
          {
            questionText: q.questionText,
            type: q.type ?? "text",
            choices: q.choices ?? null,
            companyId: templateCompanyId,
            status: "active",
            createdBy: req.user?.id ?? null,
          },
          { transaction: t }
        );

        tqRows.push({
          templateId: template.id,
          questionId: newQ.id,
          questionText: newQ.questionText,
          type: newQ.type,
          choices: newQ.choices,
          required: !!q.required,
          order: typeof q.order === "number" ? q.order : i,
        });
      } else {
        await t.rollback();
        throw HttpError(
          400,
          "Invalid question item. Provide questionId or questionText"
        );
      }
    }

    if (tqRows.length) {
      await TemplateQuestion.bulkCreate(tqRows, { transaction: t });
    }

    await t.commit();

    const result = await Template.findByPk(template.id, {
      include: [
        {
          model: TemplateQuestion,
          as: "items",
          include: [{ model: Question, as: "question" }],
        },
      ],
      order: [[{ model: TemplateQuestion, as: "items" }, "order", "ASC"]],
    });

    res.status(201).json(result);
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

  if (questions !== undefined && !Array.isArray(questions)) {
    throw HttpError(400, "questions must be an array");
  }

  if (questions === undefined) {
    await template.update({
      name: name ?? template.name,
      description: description ?? template.description,
      companyId:
        req.user.role === "admin"
          ? bodyCompanyId ?? template.companyId
          : template.companyId,
    });

    const withQuestions = await Template.findByPk(template.id, {
      include: [
        {
          model: TemplateQuestion,
          as: "questions",
          order: [["order", "ASC"]],
        },
      ],
    });

    return res.json(withQuestions);
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

    const prepared = (questions || []).map((q, i) => ({
      templateId: template.id,
      questionText: q.questionText ?? "",
      type: q.type ?? "text",
      choices: Array.isArray(q.choices) ? q.choices : [],
      required: !!q.required,
      order: typeof q.order === "number" ? q.order : i + 1,
    }));

    if (prepared.length) {
      await TemplateQuestion.bulkCreate(prepared, { transaction: t });
    }

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
