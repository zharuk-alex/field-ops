import HttpError from "../helpers/HttpError.js";

export default function validateParams(schema, options = {}) {
  const joiOpts = {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
    ...options,
  };
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.params, joiOpts);
    if (error) {
      const msg =
        error.details?.map((d) => d.message).join("; ") || "Invalid params";
      return next(HttpError(400, msg));
    }
    req.params = value;
    next();
  };
}
