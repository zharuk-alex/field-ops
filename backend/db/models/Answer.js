import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";

const Answer = sequelize.define(
  "Answer",
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
    },
    auditQuestionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "audit_questions", key: "id" },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "answers",
    timestamps: true,
  }
);

export default Answer;
