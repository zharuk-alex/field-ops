import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";

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
    },
    templateQuestionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "template_questions", key: "id" },
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "text",
        "number",
        "boolean",
        "choice",
        "photo",
        "rating"
      ),
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
  }
);

export default AuditQuestion;
