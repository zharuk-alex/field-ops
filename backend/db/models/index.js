import sequelize from "../Sequelize.js";

import Company from "./Company.js";
import User from "./User.js";
import Template from "./Template.js";
import Question from "./Question.js";
import Location from "./Location.js";
import Audit from "./Audit.js";
import AuditQuestion from "./AuditQuestion.js";
import Answer from "./Answer.js";
import Photo from "./Photo.js";

Company.hasMany(User, { foreignKey: "companyId", as: "users" });
User.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Company.hasMany(Location, { foreignKey: "companyId", as: "locations" });
Location.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Company.hasMany(Template, { foreignKey: "companyId", as: "templates" });
Template.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Company.hasMany(Question, { foreignKey: "companyId", as: "questions" });
Question.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Template.hasMany(Audit, { foreignKey: "templateId", as: "audits" });
Audit.belongsTo(Template, { foreignKey: "templateId", as: "template" });

Company.hasMany(Audit, { foreignKey: "companyId", as: "audits" });
Audit.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Location.hasMany(Audit, { foreignKey: "locationId", as: "audits" });
Audit.belongsTo(Location, { foreignKey: "locationId", as: "location" });

User.hasMany(Audit, { foreignKey: "assigneeId", as: "assignedAudits" });
Audit.belongsTo(User, { foreignKey: "assigneeId", as: "assignee" });

Audit.hasMany(AuditQuestion, {
  foreignKey: "auditId",
  as: "items",
  onDelete: "CASCADE",
  hooks: true,
});
AuditQuestion.belongsTo(Audit, { foreignKey: "auditId", as: "audit" });

AuditQuestion.belongsTo(Question, {
  foreignKey: "questionId",
  as: "question",
});

AuditQuestion.hasMany(Answer, {
  foreignKey: "auditQuestionId",
  as: "answers",
  onDelete: "CASCADE",
  hooks: true,
});
Answer.belongsTo(AuditQuestion, {
  foreignKey: "auditQuestionId",
  as: "auditQuestion",
});

Audit.hasMany(Photo, {
  foreignKey: "auditId",
  as: "photos",
  onDelete: "CASCADE",
  hooks: true,
});
Photo.belongsTo(Audit, { foreignKey: "auditId", as: "audit" });

Answer.hasMany(Photo, {
  foreignKey: "answerId",
  as: "photos",
  onDelete: "CASCADE",
  hooks: true,
});
Photo.belongsTo(Answer, { foreignKey: "answerId", as: "answer" });

User.hasMany(Photo, { foreignKey: "userId", as: "photos" });
Photo.belongsTo(User, { foreignKey: "userId", as: "user" });

export {
  sequelize,
  Company,
  User,
  Template,
  Question,
  Location,
  Audit,
  AuditQuestion,
  Answer,
  Photo,
};
