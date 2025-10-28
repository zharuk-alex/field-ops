import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";
import { QUESTION_TYPES } from "#root/constants/index.js";

const TemplateQuestion = sequelize.define(
  "TemplateQuestion",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "templates", key: "id" },
      field: "template_id",
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
    required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "template_questions",
    timestamps: true,
    underscored: true,
  }
);

export default TemplateQuestion;
