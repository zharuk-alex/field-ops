// backend/db/models/index.js

import sequelize from "../Sequelize.js";

import Company from "./Company.js";
import User from "./User.js";
import Template from "./Template.js";
import Question from "./Question.js";
import TemplateQuestion from "./TemplateQuestion.js";
import Location from "./Location.js";
import Audit from "./Audit.js";
import AuditQuestion from "./AuditQuestion.js";
import Answer from "./Answer.js";
import Attachment from "./Attachment.js";
import AuditHistory from "./AuditHistory.js";

Company.hasMany(User, { foreignKey: "companyId", as: "users" });
User.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Company.hasMany(Location, { foreignKey: "companyId", as: "locations" });
Location.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Template.hasMany(TemplateQuestion, {
  as: "questions",
  foreignKey: "templateId",
  onDelete: "CASCADE",
});
TemplateQuestion.belongsTo(Template, {
  foreignKey: "templateId",
  as: "template",
});

Question.hasMany(TemplateQuestion, {
  foreignKey: "questionId",
  as: "templateLinks",
});
TemplateQuestion.belongsTo(Question, {
  foreignKey: "questionId",
  as: "question",
});

Template.hasMany(Audit, { foreignKey: "templateId", as: "audits" });
Audit.belongsTo(Template, { foreignKey: "templateId", as: "template" });

Audit.hasMany(AuditQuestion, { foreignKey: "auditId", as: "items" });
AuditQuestion.belongsTo(Audit, { foreignKey: "auditId", as: "audit" });

AuditQuestion.belongsTo(TemplateQuestion, {
  foreignKey: "templateQuestionId",
  as: "templateQuestion",
});

AuditQuestion.belongsTo(Question, {
  foreignKey: "questionId",
  as: "question",
});

AuditQuestion.hasMany(Answer, { foreignKey: "auditQuestionId", as: "answers" });
Answer.belongsTo(AuditQuestion, {
  foreignKey: "auditQuestionId",
  as: "auditQuestion",
});

Answer.hasMany(Attachment, { foreignKey: "answerId", as: "attachments" });
Attachment.belongsTo(Answer, { foreignKey: "answerId", as: "answer" });

Audit.hasMany(Attachment, { foreignKey: "auditId", as: "attachments" });
Attachment.belongsTo(Audit, { foreignKey: "auditId", as: "audit" });

Audit.hasMany(AuditHistory, { foreignKey: "auditId", as: "history" });
AuditHistory.belongsTo(Audit, { foreignKey: "auditId", as: "audit" });

export {
  sequelize,
  Company,
  User,
  Template,
  Question,
  TemplateQuestion,
  Location,
  Audit,
  AuditQuestion,
  Answer,
  Attachment,
  AuditHistory,
};
