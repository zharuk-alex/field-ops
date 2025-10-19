import HttpError from "../helpers/HttpError.js";

import { findUser } from "../services/authServices.js";

import { verifyToken } from "../helpers/jwt.js";

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(HttpError(401));
  }

  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    return next(HttpError(401, "Bearer missing"));
  }

  const { data, error } = verifyToken(token);
  if (error) {
    return next(HttpError(401, error.message));
  }

  const user = await findUser({ email: data.email });
  if (!user) {
    return next(HttpError(401, "User not found"));
  }

  if (user.token !== token) {
    return next(HttpError(401));
  }

  req.user = user;

  next();
};

export default authenticate;
