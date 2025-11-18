import HttpError from "../helpers/HttpError.js";
import User from "../db/models/User.js";
import { verifyToken } from "../helpers/jwt.js";

const authenticate = async (req, _res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(HttpError(401, "Authorization header missing"));
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    return next(HttpError(401, "Bearer missing"));
  }

  const { data, error } = verifyToken(token);
  if (error) {
    return next(HttpError(401, error.message));
  }

  const user = await User.findByPk(data.id);
  if (!user) {
    return next(HttpError(401, "User not found"));
  }

  if (user.status !== "active") {
    return next(HttpError(403, "Account is inactive"));
  }

  if (user.token !== token) {
    return next(HttpError(401, "Token mismatch"));
  }

  req.user = user;
  next();
};

export default authenticate;
