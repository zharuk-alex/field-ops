import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";
import { QUESTION_TYPES, QUESTION_STATUSES } from "#root/constants/index.js";

const Question = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "company_id",
      references: { model: "companies", key: "id" },
    },
    status: {
      type: DataTypes.ENUM(...QUESTION_STATUSES),
      allowNull: false,
      defaultValue: "active",
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "created_by",
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "questions",
    timestamps: true,
    underscored: true,
  }
);

export default Question;
