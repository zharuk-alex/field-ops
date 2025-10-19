import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import healthRouter from "./routes/healthRouter.js";
import authRouter from "./routes/authRouter.js";

dotenv.config({
  path:
    process.env.DOTENV_PATH || new URL("../env/.env.local", import.meta.url),
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("tiny"));
app.use(express.json());

const allowedOrigins = [
  "https://localhost:9000",
  "http://localhost:9000",
  "https://field-ops.vercel.app",
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.static("public"));

app.use("/api/health", healthRouter);

app.use("/api/auth", authRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.get("/api/health/live", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server is running. Use our API on port: ${PORT}`);
});
