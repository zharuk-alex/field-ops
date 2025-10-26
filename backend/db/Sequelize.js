import { Sequelize } from "sequelize";

const dbUrl = process.env.DB_URL || process.env.DATABASE_URL || null;
const useSSL =
  process.env.DB_SSL === "require" || process.env.PGSSL === "require";

let sequelize;
if (dbUrl) {
  sequelize = new Sequelize(dbUrl, {
    dialect: "postgres",
    logging: false,
    dialectOptions: useSSL
      ? { ssl: { require: true, rejectUnauthorized: false }, keepAlive: true }
      : { keepAlive: true },
    pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  });
} else {
  sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 5432),
    username:
      process.env.DB_USER || process.env.DB_USERNAME || process.env.USER,
    password: process.env.DB_PASSWORD || process.env.DB_PASS || undefined,
    database: process.env.DB_NAME || process.env.DATABASE_NAME || "fieldops",
    logging: false,
    dialectOptions: useSSL
      ? { ssl: { require: true, rejectUnauthorized: false }, keepAlive: true }
      : { keepAlive: true },
    pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  });
}

export default sequelize;
