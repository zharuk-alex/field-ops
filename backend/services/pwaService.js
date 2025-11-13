import {
  Template,
  Audit,
  AuditQuestion,
  Question,
  Location,
  Company,
  Answer,
} from "#root/db/models/index.js";
import { Op } from "sequelize";
import HttpError from "../helpers/HttpError.js";

export async function getAvailableTemplates(userId, companyId) {
  const whereCondition = {
    status: "active",
  };

  if (companyId) {
    whereCondition.companyId = companyId;
  }

  const templates = await Template.findAll({
    where: whereCondition,
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name"],
        required: false,
      },
    ],
    order: [["name", "ASC"]],
  });

  const enriched = await Promise.all(
    templates.map(async (t) => {
      const plain = t.get({ plain: true });

      plain.questionsCount = plain.questionsIds?.length || 0;

      if (plain.questionsIds?.length > 0) {
        const questions = await Question.findAll({
          where: { id: { [Op.in]: plain.questionsIds } },
          attributes: ["id", "questionText", "type", "choices", "status", "required"],
        });

        plain.questions = plain.questionsIds
          .map((qId) => questions.find((q) => q.id === qId))
          .filter(Boolean)
          .map((q) => q.get({ plain: true }));
      } else {
        plain.questions = [];
      }

      if (plain.locationIds?.length > 0) {
        const locations = await Location.findAll({
          where: { id: { [Op.in]: plain.locationIds } },
          attributes: ["id", "name", "address", "lat", "lng"],
        });
        plain.locations = locations.map((l) => l.get({ plain: true }));
      } else {
        plain.locations = [];
      }

      return plain;
    })
  );

  return enriched;
}

export async function saveAudit({
  templateId,
  locationId,
  answers,
  startedAt,
  completedAt,
  localId,
  userId,
  companyId,
  userRole,
}) {
  const template = await Template.findByPk(templateId);

  if (!template) {
    throw HttpError(404, "Template not found");
  }

  if (userRole !== "admin" && template.companyId !== companyId) {
    throw HttpError(403, "Access denied to this template");
  }

  const auditCompanyId = companyId || template.companyId;

  if (locationId) {
    const location = await Location.findByPk(locationId);
    if (!location || location.companyId !== auditCompanyId) {
      throw HttpError(400, "Invalid location");
    }

    if (
      template.locationIds?.length > 0 &&
      !template.locationIds.includes(locationId)
    ) {
      throw HttpError(400, "This template is not available for this location");
    }
  }

  const audit = await Audit.create({
    templateId,
    companyId: auditCompanyId,
    locationId: locationId || null,
    name: template.name,
    description: template.description,
    status: "submitted",
    assigneeId: userId,
    createdBy: userId,
    startsAt: startedAt || new Date(),
    endsAt: completedAt || new Date(),
    meta: localId ? { localId } : null,
  });

  if (template.questionsIds?.length > 0) {
    const questions = await Question.findAll({
      where: {
        id: { [Op.in]: template.questionsIds },
      },
    });

    const auditQuestions = template.questionsIds.map((qId, index) => {
      const question = questions.find((q) => q.id === qId);
      if (!question) return null;

      return {
        auditId: audit.id,
        questionId: question.id,
        questionText: question.questionText,
        type: question.type,
        choices: question.choices,
        order: index + 1,
        required: question.required ?? false,
      };
    });

    const validQuestions = auditQuestions.filter(Boolean);

    if (validQuestions.length > 0) {
      const createdQuestions = await AuditQuestion.bulkCreate(validQuestions, {
        returning: true,
      });

      if (answers && answers.length > 0) {
        const answerRecords = answers
          .map((ans) => {
            const auditQuestion = createdQuestions.find(
              (aq) => aq.questionId === ans.questionId
            );

            if (!auditQuestion) return null;

            return {
              auditId: audit.id,
              auditQuestionId: auditQuestion.id,
              userId,
              value: ans.value,
              comment: ans.comment || null,
            };
          })
          .filter(Boolean);

        if (answerRecords.length > 0) {
          await Answer.bulkCreate(answerRecords);
        }
      }
    }
  }

  const result = await Audit.findByPk(audit.id, {
    include: [
      {
        model: AuditQuestion,
        as: "items",
        separate: true,
        order: [["order", "ASC"]],
        include: [
          {
            model: Answer,
            as: "answers",
            attributes: ["id", "value", "comment", "userId"],
          },
        ],
      },
      {
        model: Location,
        as: "location",
        attributes: ["id", "name", "address"],
        required: false,
      },
    ],
  });

  return result.get({ plain: true });
}
