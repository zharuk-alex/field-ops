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
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 5432);
  const username =
    process.env.DB_USER ||
    process.env.DB_USERNAME ||
    process.env.USER ||
    "postgres";
  const password = process.env.DB_PASSWORD || process.env.DB_PASS || undefined;
  const database =
    process.env.DB_NAME || process.env.DATABASE_NAME || "fieldops";

  sequelize = new Sequelize({
    dialect: "postgres",
    host,
    port,
    username,
    password,
    database,
    logging: false,
    dialectOptions: useSSL
      ? { ssl: { require: true, rejectUnauthorized: false }, keepAlive: true }
      : { keepAlive: true },
    pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  });
}

try {
  await sequelize.authenticate();
  console.log("✅ Database connection successful.");
} catch (err) {
  console.error("❌ Database connection error:", err.message);
  process.exit(1);
}

export default sequelize;
