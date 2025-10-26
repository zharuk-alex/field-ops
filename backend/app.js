import dotenv from "dotenv";

dotenv.config({
  path:
    process.env.DOTENV_PATH || new URL("../env/.env.local", import.meta.url),
});

import express from "express";
import morgan from "morgan";
import cors from "cors";

import healthRouter from "./routes/healthRouter.js";
import authRouter from "./routes/authRouter.js";
import usersRouter from "./routes/usersRouter.js";
import companiesRouter from "./routes/companiesRouter.js";
import templatesRouter from "./routes/templatesRouter.js";

import "./db/models/index.js";
import sequelize from "./db/Sequelize.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("tiny"));
app.use(express.json());

const allowedOrigins = [
  "https://localhost:9000",
  "http://localhost:9000",
  "https://localhost:9100",
  "http://localhost:9100",
  "http://127.0.0.1:9000",
  "http://127.0.0.1:9100",
  "https://field-ops-ten.vercel.app",
  "https://field-ops-admin-rho.vercel.app",
];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.static("public"));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/templates", templatesRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful.");

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("DB synced (alter) in dev");
    } else {
      // await runMigrations();
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running. Use our API on port: ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
};
start();
