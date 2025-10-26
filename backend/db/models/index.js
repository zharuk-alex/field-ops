import sequelize from "../Sequelize.js";
import Company from "./Company.js";
import User from "./User.js";
import Template from "./Template.js";
import TemplateQuestion from "./TemplateQuestion.js";
import Location from "./Location.js";
import Audit from "./Audit.js";
import AuditQuestion from "./AuditQuestion.js";
import Answer from "./Answer.js";
import Attachment from "./Attachment.js";
import AuditHistory from "./AuditHistory.js";

Company.hasMany(User, { foreignKey: "companyId" });
User.belongsTo(Company, { foreignKey: "companyId" });

Company.hasMany(Location, { foreignKey: "companyId" });
Location.belongsTo(Company, { foreignKey: "companyId" });

Template.hasMany(TemplateQuestion, {
  as: "questions",
  foreignKey: "templateId",
  onDelete: "CASCADE",
});
TemplateQuestion.belongsTo(Template, { foreignKey: "templateId" });

Template.hasMany(Audit, { foreignKey: "templateId" });
Audit.belongsTo(Template, { foreignKey: "templateId" });

Audit.hasMany(AuditQuestion, { foreignKey: "auditId" });
AuditQuestion.belongsTo(Audit, { foreignKey: "auditId" });

AuditQuestion.hasMany(Answer, { foreignKey: "auditQuestionId" });
Answer.belongsTo(AuditQuestion, { foreignKey: "auditQuestionId" });

Answer.hasMany(Attachment, { foreignKey: "answerId" });
Attachment.belongsTo(Answer, { foreignKey: "answerId" });

Audit.hasMany(Attachment, { foreignKey: "auditId" });
Attachment.belongsTo(Audit, { foreignKey: "auditId" });

Audit.hasMany(AuditHistory, { foreignKey: "auditId" });
AuditHistory.belongsTo(Audit, { foreignKey: "auditId" });

export {
  sequelize,
  Company,
  User,
  Template,
  TemplateQuestion,
  Location,
  Audit,
  AuditQuestion,
  Answer,
  Attachment,
  AuditHistory,
};
