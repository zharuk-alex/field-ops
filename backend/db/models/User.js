import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatarURL: {
      type: DataTypes.STRING,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    verify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "manager", "auditor"),
      allowNull: false,
      defaultValue: "auditor",
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "companies", key: "id" },
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;
