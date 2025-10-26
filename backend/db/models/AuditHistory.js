import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";

const AuditHistory = sequelize.define(
  "AuditHistory",
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
    actorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "audit_history",
    timestamps: true,
  }
);

export default AuditHistory;
