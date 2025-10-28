import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";
import { QUESTION_TYPES } from "#root/constants/index.js";

const AuditQuestion = sequelize.define(
  "AuditQuestion",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    auditId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "audits", key: "id" },
      field: "audit_id",
    },
    templateQuestionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "template_questions", key: "id" },
      field: "template_question_id",
    },
    questionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "questions", key: "id" },
      field: "question_id",
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "question_text",
    },
    type: {
      type: DataTypes.ENUM(...QUESTION_TYPES),
      allowNull: false,
      defaultValue: "text",
    },
    choices: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "audit_questions",
    timestamps: true,
    underscored: true,
  }
);

export default AuditQuestion;
