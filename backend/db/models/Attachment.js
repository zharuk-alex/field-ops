import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";

const Attachment = sequelize.define(
  "Attachment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    auditId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "audits", key: "id" },
    },
    answerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "answers", key: "id" },
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "attachments",
    timestamps: true,
  }
);

export default Attachment;
