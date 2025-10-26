import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";

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
      allowNull: false,
      references: { model: "templates", key: "id" },
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
  }
);

export default TemplateQuestion;
