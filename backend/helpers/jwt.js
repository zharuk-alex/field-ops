import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-fallback-secret-please-change";

export const createToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });

export const verifyToken = (token) => {
  try {
    const data = jwt.verify(token, JWT_SECRET);
    return { data };
  } catch (error) {
    return { error };
  }
};
