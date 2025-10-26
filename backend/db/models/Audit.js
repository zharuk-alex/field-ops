import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";

const Audit = sequelize.define(
  "Audit",
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
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "companies", key: "id" },
    },
    locationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "locations", key: "id" },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "draft",
        "open",
        "in_progress",
        "submitted",
        "reviewed",
        "closed"
      ),
      defaultValue: "draft",
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endsAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "audits",
    timestamps: true,
  }
);

export default Audit;
